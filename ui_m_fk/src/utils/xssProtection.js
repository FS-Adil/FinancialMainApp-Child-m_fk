/**
 * Защита от XSS (Cross-Site Scripting) атак
 * 
 * Решает проблемы:
 * 1. Инъекция вредоносного HTML/JavaScript через пользовательские данные
 * 2. XSS через URL (javascript: протокол)
 * 3. Безопасное отображение данных от API
 * 
 * Все данные, которые приходят от пользователя или API,
 * должны проходить через эти функции перед отображением в DOM
 */
export class XSSProtection {
  /**
   * Карта замены опасных HTML символов
   * Преобразует < > " ' & / в безопасные HTML entities
   */
  static #htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  /**
   * Экранирование HTML символов
   * 
   * Проблема: Пользователь может ввести <script>alert('xss')</script>
   * Решение: Преобразуем в &lt;script&gt;alert('xss')&lt;/script&gt;
   * 
   * @param {string} str - Строка для экранирования
   * @returns {string} Безопасная строка
   */
  static escapeHTML(str) {
    if (!str && str !== 0) return '';
    
    return String(str).replace(
      /[&<>"'/]/g, 
      char => XSSProtection.#htmlEscapes[char]
    );
  }

  /**
   * Санитизация URL
   * 
   * Проблема: javascript:alert('xss') в href
   * Решение: Блокируем опасные протоколы
   * 
   * @param {string} url - URL для проверки
   * @returns {string} Безопасный URL или пустая строка
   */
  static sanitizeURL(url) {
    if (!url) return '';
    
    // Список опасных протоколов
    const dangerousProtocols = /^(javascript|data|vbscript):/i;
    
    if (dangerousProtocols.test(url)) {
      console.warn('XSS Protection: Blocked dangerous URL protocol');
      return '';
    }
    
    return url;
  }

  /**
   * Безопасное создание HTML элементов
   * 
   * Проблема: innerHTML с пользовательскими данными
   * Решение: Используем textContent и безопасные атрибуты
   * 
   * @param {string} tag - HTML тег
   * @param {Object} attributes - Атрибуты элемента
   * @param {string} textContent - Текстовое содержимое
   * @returns {HTMLElement} Безопасный элемент
   */
  static createSafeElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    // Безопасно устанавливаем атрибуты
    Object.entries(attributes).forEach(([key, value]) => {
      // Блокируем inline обработчики событий (onclick, onerror и т.д.)
      if (key.toLowerCase().startsWith('on')) {
        console.warn(`XSS Protection: Blocked inline event handler: ${key}`);
        return;
      }
      
      // Для URL атрибутов применяем санитизацию
      if (key === 'href' || key === 'src' || key === 'action') {
        element.setAttribute(key, XSSProtection.sanitizeURL(value));
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Используем textContent вместо innerHTML для безопасности
    element.textContent = textContent;
    
    return element;
  }

  /**
   * Санитизация объекта данных
   * Рекурсивно очищает все строковые поля
   * 
   * @param {Object} data - Объект для санитизации
   * @returns {Object} Очищенный объект
   */
  static sanitizeObject(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = Array.isArray(data) ? [] : {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = XSSProtection.escapeHTML(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = XSSProtection.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}