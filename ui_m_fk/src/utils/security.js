/**
 * Общие утилиты безопасности
 * 
 * Решает проблемы:
 * 1. Валидация пользовательского ввода перед отправкой
 * 2. Проверка формата email
 * 3. Проверка сложности пароля
 * 4. Проверка безопасности URL
 */
export class SecurityUtils {
  /**
   * Санитизация пользовательского ввода
   * Удаляет потенциально опасные символы и ограничивает длину
   * 
   * @param {string} input - Пользовательский ввод
   * @returns {string} Очищенная строка
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '')           // HTML теги
      .replace(/javascript:/gi, '')    // javascript: протокол
      .replace(/on\w+=/gi, '')        // Обработчики событий
      .replace(/<script/gi, '')       // Script теги
      .trim()
      .substring(0, 500);             // Ограничение длины
  }

  /**
   * Валидация email адреса
   * 
   * @param {string} email - Email для проверки
   * @returns {string|null} Очищенный email или null
   */
  static validateEmail(email) {
    const sanitized = SecurityUtils.sanitizeInput(email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(sanitized) ? sanitized.toLowerCase() : null;
  }

  /**
   * Валидация пароля по требованиям безопасности
   * 
   * @param {string} password - Пароль для проверки
   * @returns {Object} Результат валидации с детализацией ошибок
   */
  static validatePassword(password) {
    const minLength = 8;
    
    const checks = {
      length: password.length >= minLength,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noSpaces: !/\s/.test(password)
    };
    
    return {
      valid: Object.values(checks).every(Boolean),
      errors: Object.entries(checks)
        .filter(([, valid]) => !valid)
        .map(([key]) => key)
    };
  }

  /**
   * Проверка безопасности URL
   * 
   * @param {string} url - URL для проверки
   * @returns {boolean} Безопасен ли URL
   */
  static isValidURL(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
}