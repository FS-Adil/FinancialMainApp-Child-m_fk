/**
 * Безопасная работа с postMessage API
 * 
 * Решает проблемы:
 * 1. Проверка origin отправителя (защита от поддельных сообщений)
 * 2. Валидация структуры сообщений
 * 3. Защита от инъекций в сообщениях
 * 4. Ограничение размера сообщений (защита от DoS)
 */
export class PostMessageSecurity {
  #allowedOrigins;
  #messageHandlers;
  #maxMessageSize;

  constructor(maxMessageSize = 10000) {
    this.#allowedOrigins = new Set();
    this.#messageHandlers = new Map();
    this.#maxMessageSize = maxMessageSize;
  }

  /**
   * Добавление разрешенного origin
   * @param {string} origin - URL разрешенного источника
   */
  addAllowedOrigin(origin) {
    try {
      const url = new URL(origin);
      this.#allowedOrigins.add(url.origin);
    } catch (error) {
      console.error('PostMessage Security: Invalid origin format', origin);
    }
  }

  /**
   * Проверка, разрешен ли origin
   * @param {string} origin - Origin для проверки
   * @returns {boolean}
   */
  isOriginAllowed(origin) {
    return this.#allowedOrigins.has(origin);
  }

  /**
   * Валидация структуры сообщения
   * Проверяет:
   * - Это объект
   * - Есть поле type (строка)
   * - Нет инъекций в type
   * - Размер не превышает лимит
   * 
   * @param {*} data - Данные сообщения
   * @returns {boolean} Валидно ли сообщение
   */
  validateMessage(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.type || typeof data.type !== 'string') return false;
    
    // Защита от инъекций в type
    if (/[<>'"]/.test(data.type)) return false;
    
    // Проверка размера (защита от DoS)
    try {
      const size = JSON.stringify(data).length;
      if (size > this.#maxMessageSize) return false;
    } catch {
      return false;
    }
    
    return true;
  }

  /**
   * Безопасная отправка сообщения родительскому окну
   * 
   * @param {Window} targetWindow - Целевое окно
   * @param {Object} message - Сообщение
   * @param {string} targetOrigin - Ожидаемый origin получателя
   * @returns {boolean} Успешность отправки
   */
  sendSecureMessage(targetWindow, message, targetOrigin) {
    if (!targetWindow) {
      console.error('PostMessage Security: Target window is null');
      return false;
    }
    
    if (!this.#allowedOrigins.has(targetOrigin)) {
      console.error('PostMessage Security: Attempt to send to unauthorized origin');
      return false;
    }

    // Добавляем метаданные безопасности
    const secureMessage = {
      ...message,
      _security: {
        timestamp: Date.now(),
        id: crypto.randomUUID(),
        source: 'cost-calculation-app'
      }
    };

    try {
      targetWindow.postMessage(secureMessage, targetOrigin);
      return true;
    } catch (error) {
      console.error('PostMessage Security: Failed to send message', error);
      return false;
    }
  }

  /**
   * Подписка на безопасные сообщения
   * Автоматически фильтрует небезопасные сообщения
   * 
   * @param {Function} handler - Обработчик (data, origin, source)
   * @returns {Function} Функция для отписки
   */
  onMessage(handler) {
    const wrappedHandler = (event) => {
      // Игнорируем сообщения от самого себя
      if (event.source === window) return;
      
      // Проверяем origin
      if (!this.isOriginAllowed(event.origin)) {
        console.warn('PostMessage Security: Message from unauthorized origin:', event.origin);
        return;
      }
      
      // Валидируем сообщение
      if (!this.validateMessage(event.data)) {
        console.warn('PostMessage Security: Invalid message structure');
        return;
      }
      
      // Проверяем, что сообщение не старше 5 минут (защита от replay)
      if (event.data._security) {
        const age = Date.now() - event.data._security.timestamp;
        if (age > 300000) {
          console.warn('PostMessage Security: Message too old');
          return;
        }
      }
      
      handler(event.data, event.origin, event.source);
    };

    window.addEventListener('message', wrappedHandler);
    
    // Возвращаем функцию для отписки
    return () => window.removeEventListener('message', wrappedHandler);
  }
}