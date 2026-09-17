package com.company.costbff.service;

import com.company.costbff.model.UserSession;
import com.company.costbff.model.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * Сервис управления сессиями
 *
 * Решает проблемы:
 * 1. Создание сессии после успешной аутентификации
 * 2. Извлечение identity из сессии (BFF НЕ доверяет клиенту!)
 * 3. Валидация device fingerprint
 * 4. Автоматическое удаление истекших сессий
 * 5. Поддержка Cookie и Bearer Token режимов
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String SESSION_PREFIX = "session:";
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.session.ttl-minutes}")
    private int sessionTtlMinutes;

    /**
     * Создание новой сессии
     * Вызывается после успешной аутентификации
     */
    public String createSession(
            Long userId,
            String email,
            String role,
            String organizationId,
            String organizationName,
            String deviceFingerprint,
            String userAgent,
            String ipAddress) {

        // Генерируем уникальный ID сессии
        String sessionId = generateSessionId();

        Instant now = Instant.now();
        Instant expiresAt = now.plus(Duration.ofMinutes(sessionTtlMinutes));

        // Создаем сессию
        UserSession session = UserSession.builder()
                .sessionId(sessionId)
                .userId(userId)
                .email(email)
                .role(role)
                .organizationId(organizationId)
                .organizationName(organizationName)
                .deviceFingerprint(deviceFingerprint)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .createdAt(now)
                .lastActivity(now)
                .expiresAt(expiresAt)
                .active(true)
                .build();

        // Сохраняем в Redis с TTL
        String key = SESSION_PREFIX + sessionId;
        redisTemplate.opsForValue().set(key, session, sessionTtlMinutes, TimeUnit.MINUTES);

        log.info("Session created: userId={}, sessionId={}", userId, sessionId);

        return sessionId;
    }

    /**
     * Получение контекста пользователя из HttpServletRequest
     * Поддерживает Cookie и Bearer Token
     */
    public UserContext getUserContext(HttpServletRequest request) {
        // Извлекаем sessionId из разных источников
        String sessionId = extractSessionId(request);

        if (sessionId == null) {
            throw new SessionNotFoundException("Session ID not found in request");
        }

        return getUserContext(sessionId, request.getHeader("X-Device-Fingerprint"));
    }

    /**
     * Получение контекста пользователя по sessionId
     */
    public UserContext getUserContext(String sessionId) {
        return getUserContext(sessionId, null);
    }

    /**
     * Получение контекста пользователя по sessionId с проверкой fingerprint
     */
    public UserContext getUserContext(String sessionId, String currentFingerprint) {
        // Получаем сессию из Redis
        UserSession session = getSession(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("Session not found: " + sessionId));

        // Проверяем активность
        if (!session.isActive()) {
            throw new SessionNotFoundException("Session is not active");
        }

        // Проверяем истечение
        if (Instant.now().isAfter(session.getExpiresAt())) {
            deleteSession(sessionId);
            throw new SessionNotFoundException("Session expired");
        }

        // Проверяем device fingerprint (защита от кражи токена)
        if (currentFingerprint != null && session.getDeviceFingerprint() != null &&
                !currentFingerprint.equals(session.getDeviceFingerprint())) {
            log.warn("Device fingerprint mismatch for session: {}", sessionId);
            deleteSession(sessionId);
            throw new SecurityException("Device fingerprint mismatch");
        }

        // Обновляем время последней активности
        session.setLastActivity(Instant.now());
        String key = SESSION_PREFIX + sessionId;
        redisTemplate.opsForValue().set(key, session, sessionTtlMinutes, TimeUnit.MINUTES);

        // Возвращаем контекст (BFF сам формирует!)
        return UserContext.fromSession(session);
    }

    /**
     * Удаление сессии (logout)
     */
    public void deleteSession(String sessionId) {
        String key = SESSION_PREFIX + sessionId;
        redisTemplate.delete(key);
        log.info("Session deleted: {}", sessionId);
    }

    /**
     * Получение сессии из Redis
     */
    private Optional<UserSession> getSession(String sessionId) {
        String key = SESSION_PREFIX + sessionId;
        Object value = redisTemplate.opsForValue().get(key);

        if (value instanceof UserSession) {
            return Optional.of((UserSession) value);
        }

        return Optional.empty();
    }

    /**
     * Извлечение sessionId из разных источников:
     * 1. Cookie (для обычного режима)
     * 2. Authorization: Bearer token (для iframe)
     * 3. X-Session-Id заголовок (fallback)
     */
    private String extractSessionId(HttpServletRequest request) {
        // 🔑 Стратегия 1: Cookie
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("session_id".equals(cookie.getName())) {
                    log.info("🔍 Session ID extracted from cookie");
                    return cookie.getValue();
                }
            }
        }

        // 🔑 Стратегия 2: Bearer Token из Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String sessionId = authHeader.substring(7);
            log.info("🔍 Session ID extracted from Bearer token");
            return sessionId;
        }

        // 🔑 Стратегия 3: Кастомный заголовок X-Session-Id
        String sessionId = request.getHeader("X-Session-Id");
        if (sessionId != null && !sessionId.isEmpty()) {
            log.info("🔍 Session ID extracted from X-Session-Id header");
            return sessionId;
        }

        log.warn("⚠️ No session ID found in request");
        return null;
    }

    /**
     * Генерация криптографически безопасного ID сессии
     */
    private String generateSessionId() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Исключение "сессия не найдена"
     */
    public static class SessionNotFoundException extends RuntimeException {
        public SessionNotFoundException(String message) {
            super(message);
        }
    }
}