package com.company.costbff.security;

import lombok.extern.slf4j.Slf4j;

import java.util.regex.Pattern;

/**
 * Утилиты безопасности BFF
 *
 * Решает проблемы:
 * 1. Санитизация пользовательского ввода
 * 2. Валидация email
 * 3. Проверка безопасности строк
 *
 * ВАЖНО: BFF НЕ ДОВЕРЯЕТ данным от клиента!
 * Все входные данные проходят валидацию и санитизацию.
 */
@Slf4j
public class SecurityUtils {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    private static final Pattern DANGEROUS_CHARS =
            Pattern.compile("[<>\"';&|`$]");

    private static final Pattern SQL_INJECTION =
            Pattern.compile("(?i)(union|select|insert|update|delete|drop|alter|exec|execute)");

    /**
     * Санитизация строки
     * Удаляет потенциально опасные символы
     */
    public static String sanitize(String input) {
        if (input == null) return null;
        if (input.isEmpty()) return input;

        // Ограничение длины
        String sanitized = input.length() > 500 ? input.substring(0, 500) : input;

        // Проверка на инъекции
        if (DANGEROUS_CHARS.matcher(sanitized).find()) {
            log.warn("Dangerous characters detected in input");
            sanitized = DANGEROUS_CHARS.matcher(sanitized).replaceAll("");
        }

        if (SQL_INJECTION.matcher(sanitized).find()) {
            log.warn("Potential SQL injection detected");
            sanitized = SQL_INJECTION.matcher(sanitized).replaceAll("");
        }

        return sanitized.trim();
    }

    /**
     * Валидация email
     */
    public static String validateEmail(String email) {
        if (email == null) return null;

        String sanitized = sanitize(email);

        if (sanitized == null || !EMAIL_PATTERN.matcher(sanitized).matches()) {
            return null;
        }

        return sanitized.toLowerCase();
    }

    /**
     * Валидация даты (YYYY-MM-DD)
     */
    public static String validateDate(String date) {
        if (date == null) return null;

        String sanitized = sanitize(date);

        // Проверка формата YYYY-MM-DD
        if (!sanitized.matches("\\d{4}-\\d{2}-\\d{2}")) {
            return null;
        }

        return sanitized;
    }
}