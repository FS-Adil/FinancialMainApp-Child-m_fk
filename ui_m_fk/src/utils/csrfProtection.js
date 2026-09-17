// src/utils/csrfProtection.js - ПОЛНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ

export class CSRFProtection {
  static #TOKEN_KEY = 'csrf_token';
  static #TOKEN_LENGTH = 32;
  static #initialized = false; // 🔑 Флаг инициализации

  /**
   * Инициализация CSRF защиты
   */
  static init() {
    // 🔑 Защита от повторной инициализации
    if (CSRFProtection.#initialized) {
      console.log('⏭️ CSRF: Already initialized, skipping');
      return;
    }
    CSRFProtection.#initialized = true;

    const existingToken = CSRFProtection.getTokenFromCookie();
    
    if (existingToken) {
      console.log('🔄 CSRF: Using existing token:', existingToken.substring(0, 16) + '...');
      CSRFProtection.#updateMetaToken(existingToken);
    } else {
      console.log('✨ CSRF: No token found, generating new one');
      CSRFProtection.generateToken();
    }
  }

  /**
   * Генерация нового CSRF токена
   */
  static generateToken() {
    // 🔑 Удаляем старый токен из cookie перед созданием нового
    CSRFProtection.removeToken();
    
    const token = CSRFProtection.#createSecureToken();
    
    // 🔑 Устанавливаем cookie с SameSite=Lax для совместимости с BFF
    const isProduction = window.location.protocol === 'https:';
    const cookieParts = [
      `${CSRFProtection.#TOKEN_KEY}=${token}`,
      'path=/',
      'SameSite=Lax',
      `max-age=86400` // 24 часа
    ];
    
    // Secure только для HTTPS
    if (isProduction) {
      cookieParts.push('Secure');
    }
    
    document.cookie = cookieParts.join('; ');
    CSRFProtection.#updateMetaToken(token);
    
    console.log('🔑 CSRF token generated:', token.substring(0, 16) + '...');
    return token;
  }

  /**
   * Получение токена ИЗ COOKIE (не из meta)
   */
  static getTokenFromCookie() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(c => 
      c.trim().startsWith(`${CSRFProtection.#TOKEN_KEY}=`)
    );
    
    if (tokenCookie) {
      const value = tokenCookie.split('=')[1];
      if (value && value.length === CSRFProtection.#TOKEN_LENGTH * 2) {
        return value;
      }
    }
    return null;
  }

  /**
   * Получение токена (для заголовков)
   */
  static getToken() {
    // Приоритет: cookie → meta
    return CSRFProtection.getTokenFromCookie() || 
           document.querySelector('meta[name="csrf-token"]')?.content || 
           null;
  }

  /**
   * Получение заголовка с CSRF токеном
   */
  static getHeader() {
    const token = CSRFProtection.getToken();
    if (!token) {
      console.warn('⚠️ CSRF: No token available');
      return {};
    }
    return { 'X-CSRF-Token': token };
  }

  /**
   * Удаление токена
   */
  static removeToken() {
    document.cookie = `${CSRFProtection.#TOKEN_KEY}=; path=/; max-age=0`;
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) meta.content = '';
  }

  /**
   * Обновление мета-тега
   */
  static #updateMetaToken(token) {
    let meta = document.querySelector('meta[name="csrf-token"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'csrf-token';
      document.head.appendChild(meta);
    }
    meta.content = token;
  }

  /**
   * Создание безопасного токена
   */
  static #createSecureToken() {
    const array = new Uint8Array(CSRFProtection.#TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
  }
}