package com.company.costbff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Ответ аутентификации
 *
 * Решает проблемы:
 * 1. Возврат информации о пользователе
 * 2. Возврат информации об организации
 * 3. Не содержит токенов (токены в HttpOnly cookie)
 *
 * ВАЖНО: Никакие токены не возвращаются клиенту!
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private UserInfo user;
    private OrganizationInfo organization;

    /**
     * Информация об организации
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationInfo {
        private String id;
        private String name;
    }

    /**
     * Информация об user
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String email;
        private String role;
    }
}