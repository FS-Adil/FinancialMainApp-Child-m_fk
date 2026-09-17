package com.company.costbff.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Конфигурация CORS
 *
 * Решает проблемы:
 * 1. Разрешение запросов от дочернего приложения
 * 2. Разрешение запросов от родительского приложения
 * 3. Поддержка credentials (cookies)
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Разрешенные origins
        config.setAllowedOrigins(allowedOrigins);

        // Разрешенные методы
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Разрешенные заголовки
//        config.setAllowedHeaders(List.of(
//                "Content-Type",
//                "X-CSRF-Token",
//                "X-Device-Fingerprint",
//                "X-API-Key",
//                "X-Requested-With"
//        ));

        // Или просто разрешить все заголовки
         config.setAllowedHeaders(Arrays.asList("*"));

        // Разрешаем cookies
        config.setAllowCredentials(true);

        // Кэширование preflight запросов (1 час)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return source;
    }
}