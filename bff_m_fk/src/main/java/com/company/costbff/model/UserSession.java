package com.company.costbff.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;

/**
 * Модель сессии пользователя в Redis
 *
 * Решает проблемы:
 * 1. Хранение контекста пользователя
 * 2. Привязка к устройству (fingerprint)
 * 3. Автоматическое истечение (TTL)
 *
 * ВАЖНО: Сессия НЕ содержит токенов!
 * Только информацию о пользователе и организации.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSession implements Serializable {

    private static final long serialVersionUID = 1L;

    // ID сессии (ключ в Redis)
    private String sessionId;

    // ID пользователя
    private Long userId;

    // Email пользователя
    private String email;

    // Роль пользователя
    private String role;

    // Информация об организации
    private String organizationId;
    private String organizationName;
    private String organizationInn;

    // Информация об устройстве
    private String deviceFingerprint;
    private String userAgent;
    private String ipAddress;

    // Время создания
    private Instant createdAt;

    // Время последней активности
    private Instant lastActivity;

    // Время истечения
    private Instant expiresAt;

    // Активна ли сессия
    private boolean active;
}