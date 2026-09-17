package com.company.costbff.client;

import com.company.costbff.service.AuthProxyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

/**
 * Клиент для взаимодействия с Auth Service
 *
 * Решает проблемы:
 * 1. Проксирование запросов аутентификации
 * 2. Идентификация BFF через X-Service-Token
 * 3. Валидация родительской сессии
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthServiceClient {

    @Qualifier("authServiceWebClient")
    private final WebClient authServiceWebClient;

    /**
     * Аутентификация пользователя
     */
    public AuthProxyService.AuthResult authenticate(String email, String password) {
        log.info("Authenticating user via Auth Service: {}", email);

        try {
            Map response = authServiceWebClient
                    .post()
                    .uri("/api/auth/login")
                    .bodyValue(Map.of("email", email, "password", password))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Auth Service response: {}", response);

            if (response == null) {
                log.error("Auth Service returned null response");
                return new AuthProxyService.AuthResult(false, null, null, null, null, null);
            }

            // Извлекаем данные пользователя из вложенного объекта "user"
            Map<String, Object> userData = (Map<String, Object>) response.get("user");

            if (userData == null) {
                log.error("No 'user' data in response: {}", response);
                return new AuthProxyService.AuthResult(false, null, null, null, null, null);
            }

            // Безопасно извлекаем поля пользователя
            Object userId = userData.get("id");
            Object userEmail = userData.get("email");
            Object userRole = userData.get("role");

            // Извлекаем данные организации
            Map<String, Object> organizationData = (Map<String, Object>) response.get("organization");
            String organizationId = null;
            String organizationName = null;

            if (organizationData != null) {
                Object orgId = organizationData.get("id");
                Object orgName = organizationData.get("name");

                if (orgId != null) {
                    organizationId = orgId.toString();
                }
                if (orgName != null) {
                    organizationName = orgName.toString();
                }
            }

            // Проверяем обязательные поля
            if (userId == null || userEmail == null || userRole == null) {
                log.error("Missing required fields - userId: {}, email: {}, role: {}",
                        userId, userEmail, userRole);
                return new AuthProxyService.AuthResult(false, null, null, null, null, null);
            }

            log.info("Successfully authenticated - userId: {}, email: {}, role: {}",
                    userId, userEmail, userRole);

            return new AuthProxyService.AuthResult(
                    true,
                    Long.valueOf(userId.toString()),
                    userEmail.toString(),
                    userRole.toString(),
                    organizationId, // organizationId (если нужно, замените на правильное поле)
                    organizationName  // organizationName
            );

        } catch (Exception e) {
            log.error("Auth Service authentication failed", e);
            return new AuthProxyService.AuthResult(false, null, null, null, null, null);
        }
    }

    /**
     * Валидация родительской сессии
     */
    public AuthProxyService.ParentSessionValidation validateParentSession(String parentToken) {
        log.info("Validating parent session");

        try {
            Map response = authServiceWebClient
                    .post()
                    .uri("/api/auth/validate-session")
                    .bodyValue(Map.of("token", parentToken))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Session validation response: {}", response);

            if (response == null) {
                log.error("Session validation returned null");
                return new AuthProxyService.ParentSessionValidation(false, null, null, null, null, null);
            }

            // Извлекаем данные пользователя из вложенного объекта "user"
            Map<String, Object> userData = (Map<String, Object>) response.get("user");

            if (userData == null) {
                log.error("No 'user' data in session validation response");
                return new AuthProxyService.ParentSessionValidation(false, null, null, null, null, null);
            }

            // Безопасно извлекаем поля
            Object userId = userData.get("id");
            Object userEmail = userData.get("email");
            Object userRole = userData.get("role");

            // Извлекаем данные организации
            Map<String, Object> organizationData = (Map<String, Object>) response.get("organization");
            String organizationId = null;
            String organizationName = null;

            if (organizationData != null) {
                Object orgId = organizationData.get("id");
                Object orgName = organizationData.get("name");

                if (orgId != null) {
                    organizationId = orgId.toString();
                }
                if (orgName != null) {
                    organizationName = orgName.toString();
                }
            }

            // Проверяем обязательные поля
            if (userId == null || userEmail == null || userRole == null) {
                log.error("Missing required fields in session validation - userId: {}, email: {}, role: {}",
                        userId, userEmail, userRole);
                return new AuthProxyService.ParentSessionValidation(false, null, null, null, null, null);
            }

            log.info("Session validated - userId: {}, email: {}, role: {}, orgId: {}, orgName: {}",
                    userId, userEmail, userRole, organizationId, organizationName);

            return new AuthProxyService.ParentSessionValidation(
                    true,
                    Long.valueOf(userId.toString()),
                    userEmail.toString(),
                    userRole.toString(),
                    organizationId,
                    organizationName
            );

        } catch (Exception e) {
            log.error("Parent session validation failed", e);
            return new AuthProxyService.ParentSessionValidation(false, null, null, null, null, null);
        }
    }
}