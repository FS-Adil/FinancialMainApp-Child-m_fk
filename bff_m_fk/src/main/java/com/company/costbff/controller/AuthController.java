package com.company.costbff.controller;

import com.company.costbff.dto.request.LoginRequest;
import com.company.costbff.dto.request.ParentSessionRequest;
import com.company.costbff.dto.response.ApiResponse;
import com.company.costbff.dto.response.AuthResponse;
import com.company.costbff.service.AuthProxyService;
import com.company.costbff.service.CookieService;
import com.company.costbff.security.SecurityUtils;
import com.company.costbff.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Контроллер аутентификации
 *
 * Решает проблемы:
 * 1. Обработка входа через свою форму
 * 2. Обработка входа через родительское приложение
 * 3. Создание сессии после успешной аутентификации
 * 4. Проверка текущей сессии
 * 5. Выход из системы
 *
 * ВАЖНО: Поддерживает два режима:
 * - Cookie-based (для обычного запуска)
 * - Bearer Token (для iframe, где cookies заблокированы)
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthProxyService authProxyService;
    private final SessionService sessionService;
    private final CookieService cookieService;

    /**
     * Вход через свою форму (email/password)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        try {
            // Валидация и санитизация входных данных
            String email = SecurityUtils.validateEmail(request.email());
            if (email == null) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Некорректный формат email")
                );
            }

            // Аутентификация через Auth Service
            AuthProxyService.AuthResult authResult = authProxyService.authenticate(email, request.password());

            if (!authResult.success()) {
                return ResponseEntity.status(401).body(
                        ApiResponse.error("Неверные учетные данные")
                );
            }

            // Создаем сессию в BFF
            String sessionId = sessionService.createSession(
                    authResult.userId(),
                    authResult.email(),
                    authResult.role(),
                    authResult.organizationId(),
                    authResult.organizationName(),
                    httpRequest.getHeader("X-Device-Fingerprint"),
                    httpRequest.getHeader("User-Agent"),
                    httpRequest.getRemoteAddr()
            );

            // Устанавливаем session_id в HttpOnly cookie (для обычного режима)
            cookieService.setSessionCookie(httpResponse, sessionId, 1800);

            // 🔑 Возвращаем токен в теле ответа (для iframe режима)
            Map<String, Object> response = new HashMap<>();
            response.put("user", Map.of(
                    "id", authResult.userId(),
                    "email", authResult.email(),
                    "role", authResult.role()
            ));
            response.put("organization", Map.of(
                    "id", authResult.organizationId(),
                    "name", authResult.organizationName()
            ));
            response.put("token", sessionId);  // Bearer token
            response.put("expiresIn", 1800);    // 30 минут

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Login error", e);
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Внутренняя ошибка сервера")
            );
        }
    }

    /**
     * Вход через родительское приложение
     */
    @PostMapping("/parent-session")
    public ResponseEntity<?> parentSession(
            @Valid @RequestBody ParentSessionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        try {
            // Валидация родительской сессии через Auth Service
            AuthProxyService.ParentSessionValidation validation =
                    authProxyService.validateParentSession(request.parentToken());

            if (!validation.valid()) {
                return ResponseEntity.status(401).body(
                        ApiResponse.error("Недействительная сессия родительского приложения")
                );
            }

            // Создаем новую сессию в BFF
            String sessionId = sessionService.createSession(
                    validation.userId(),
                    validation.email(),
                    validation.role(),
                    validation.organizationId(),
                    validation.organizationName(),
                    httpRequest.getHeader("X-Device-Fingerprint"),
                    httpRequest.getHeader("User-Agent"),
                    httpRequest.getRemoteAddr()
            );

            cookieService.setSessionCookie(httpResponse, sessionId, 1800);

            log.info("Parent session created: sessionId={}", sessionId);

            // 🔑 Возвращаем токен в теле ответа
            Map<String, Object> response = new HashMap<>();
            response.put("user", Map.of(
                    "id", validation.userId(),
                    "email", validation.email(),
                    "role", validation.role()
            ));
            response.put("organization", Map.of(
                    "id", validation.organizationId(),
                    "name", validation.organizationName()
            ));
            response.put("token", sessionId);  // Bearer token
            response.put("expiresIn", 1800);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Parent session error", e);
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Ошибка авторизации через родительское приложение")
            );
        }
    }

    /**
     * Проверка текущей сессии
     * Поддерживает и cookie, и Bearer token
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        try {
            // BFF сам определяет identity из сессии
            var userContext = sessionService.getUserContext(request);

            log.info("User context: userId={}, email={}, role={}",
                    userContext.userId(), userContext.email(), userContext.role());

            return ResponseEntity.ok(Map.of(
                    "user", Map.of(
                            "id", userContext.userId(),
                            "email", userContext.email(),
                            "role", userContext.role()
                    ),
                    "organization", Map.of(
                            "id", userContext.organizationId()
                    )
            ));

        } catch (SessionService.SessionNotFoundException e) {
            log.error("Session not found: {}", e.getMessage());
            return ResponseEntity.status(401).body(
                    ApiResponse.error("Сессия не найдена или истекла")
            );
        }
    }

    /**
     * Обновление сессии
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Проверяем текущую сессию
            var userContext = sessionService.getUserContext(request);

            // Создаем новую сессию
            String newSessionId = sessionService.createSession(
                    userContext.userId(),
                    userContext.email(),
                    userContext.role(),
                    userContext.organizationId(),
                    null,
                    request.getHeader("X-Device-Fingerprint"),
                    request.getHeader("User-Agent"),
                    request.getRemoteAddr()
            );

            // Устанавливаем новую cookie
            cookieService.setSessionCookie(response, newSessionId, 1800);

            log.info("Session refreshed: newSessionId={}", newSessionId);

            // Возвращаем новый токен
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "token", newSessionId,
                    "expiresIn", 1800
            ));

        } catch (SessionService.SessionNotFoundException e) {
            return ResponseEntity.status(401).body(
                    ApiResponse.error("Сессия истекла")
            );
        }
    }

    /**
     * Выход из системы
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Извлекаем sessionId из разных источников
        String sessionId = extractSessionId(request);

        if (sessionId != null) {
            sessionService.deleteSession(sessionId);
            log.info("Session deleted: {}", sessionId);
        }

        // Очищаем cookies
        cookieService.clearAuthCookies(response);

        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Извлекает sessionId из cookie или Authorization header
     */
    private String extractSessionId(HttpServletRequest request) {
        // Из cookie
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("session_id".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // Из Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // Из кастомного заголовка
        return request.getHeader("X-Session-Id");
    }
}