package com.company.costbff.model;

/**
 * Контекст пользователя для передачи в микросервисы
 *
 * Решает проблемы:
 * 1. Передача identity пользователя в Cost Service
 * 2. Иммутабельность
 * 3. Минимальный набор данных
 *
 * ВАЖНО: Это НЕ токен! Микросервис доверяет BFF.
 */
public record UserContext(
        Long userId,
        String organizationId,
        String role,
        String email
) {
    /**
     * Создание контекста из сессии
     */
    public static UserContext fromSession(UserSession session) {
        return new UserContext(
                session.getUserId(),
                session.getOrganizationId(),
                session.getRole(),
                session.getEmail()
        );
    }
}