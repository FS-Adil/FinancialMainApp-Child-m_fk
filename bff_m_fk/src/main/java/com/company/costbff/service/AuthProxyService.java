package com.company.costbff.service;

import com.company.costbff.client.AuthServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Прокси-сервис для аутентификации
 *
 * Решает проблемы:
 * 1. Абстрагирование взаимодействия с Auth Service
 * 2. Предоставление результатов аутентификации
 * 3. Валидация родительской сессии
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthProxyService {

    private final AuthServiceClient authServiceClient;

    /**
     * Аутентификация пользователя по email и паролю
     */
    public AuthResult authenticate(String email, String password) {
        log.info("Proxying authentication request for: {}", email);
        return authServiceClient.authenticate(email, password);
    }

    /**
     * Валидация родительской сессии
     */
    public ParentSessionValidation validateParentSession(String parentToken) {
        log.info("Proxying parent session validation");
        return authServiceClient.validateParentSession(parentToken);
    }

    /**
     * Результат аутентификации
     */
    public record AuthResult(
            boolean success,
            Long userId,
            String email,
            String role,
            String organizationId,
            String organizationName
    ) {}

    /**
     * Результат валидации родительской сессии
     */
    public record ParentSessionValidation(
            boolean valid,
            Long userId,
            String email,
            String role,
            String organizationId,
            String organizationName
    ) {}
}