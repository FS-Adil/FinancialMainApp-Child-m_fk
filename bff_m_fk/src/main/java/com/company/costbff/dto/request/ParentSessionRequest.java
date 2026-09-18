package com.company.costbff.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO запроса на вход через родительское приложение
 *
 * Решает проблемы:
 * 1. Валидация токена родительской сессии
 * 2. Типобезопасность
 */
public record ParentSessionRequest(
        @NotBlank(message = "Токен родительской сессии обязателен")
        String parentToken
) {}