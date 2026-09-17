package com.company.costbff.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Сервис для работы с HttpOnly cookies
 *
 * Решает проблемы:
 * 1. Установка session ID в безопасную cookie
 * 2. Очистка cookies при logout
 * 3. Настройка флагов безопасности (HttpOnly, Secure, SameSite)
 */
@Service
public class CookieService {

    @Value("${app.cookie.domain:localhost}")
    private String cookieDomain;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Strict}")
    private String sameSite;

    /**
     * Установка cookie с ID сессии
     */
    public void setSessionCookie(HttpServletResponse response, String sessionId, int maxAgeSeconds) {
        Cookie cookie = new Cookie("session_id", sessionId);
        cookie.setHttpOnly(true);      // JavaScript не может прочитать
        cookie.setSecure(cookieSecure); // Только HTTPS в production
        cookie.setPath("/");           // Доступна для всех путей
        cookie.setDomain(cookieDomain);
        cookie.setMaxAge(maxAgeSeconds);

        // SameSite атрибут (защита от CSRF)
        cookie.setAttribute("SameSite", sameSite);

        response.addCookie(cookie);
    }

    /**
     * Очистка всех auth cookies
     */
    public void clearAuthCookies(HttpServletResponse response) {
        // Очищаем session cookie
        Cookie sessionCookie = new Cookie("session_id", "");
        sessionCookie.setHttpOnly(true);
        sessionCookie.setSecure(cookieSecure);
        sessionCookie.setPath("/");
        sessionCookie.setDomain(cookieDomain);
        sessionCookie.setMaxAge(0);
        sessionCookie.setAttribute("SameSite", sameSite);

        response.addCookie(sessionCookie);
    }
}