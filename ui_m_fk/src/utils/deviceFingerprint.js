/**
 * Генерация fingerprint устройства
 * 
 * Решает проблему: Привязка сессии к конкретному устройству.
 * Если злоумышленник украдет cookie, он не сможет их использовать
 * с другого устройства, так как fingerprint не совпадет.
 * 
 * Отпечаток отправляется в заголовке X-Device-Fingerprint
 * и проверяется BFF при каждом запросе.
 */
export class DeviceFingerprint {
  /**
   * Получение fingerprint устройства
   * Использует стабильные характеристики браузера
   * @returns {string} Хеш отпечатка
   */
  static getFingerprint() {
    const components = [
      navigator.userAgent,                    // Браузер и ОС
      navigator.language,                     // Язык
      screen.colorDepth,                      // Глубина цвета
      `${screen.width}x${screen.height}`,     // Разрешение
      new Date().getTimezoneOffset(),         // Часовой пояс
      navigator.hardwareConcurrency || 'unknown', // Ядра CPU
      navigator.platform,                     // Платформа
      DeviceFingerprint.#getCanvasFingerprint() // Canvas отпечаток
    ];

    return DeviceFingerprint.#hashString(components.join('|'));
  }

  /**
   * Canvas fingerprinting
   * Разные устройства по-разному рендерят canvas из-за различий в:
   * - Драйверах видеокарты
   * - Сглаживании шрифтов
   * - Доступных шрифтах
   * @returns {string} Base64 изображения canvas
   * @private
   */
  static #getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      
      const ctx = canvas.getContext('2d');
      
      // Рисуем текст с разными стилями
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device FP', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device FP', 4, 17);
      
      return canvas.toDataURL();
    } catch {
      return 'canvas-not-supported';
    }
  }

  /**
   * Получение заголовков для HTTP запроса
   * @returns {Object} Заголовки с fingerprint
   */
  static getHeaders() {
    return {
      'X-Device-Fingerprint': DeviceFingerprint.getFingerprint(),
      'X-Requested-With': 'XMLHttpRequest' // Защита от CSRF
    };
  }

  /**
   * Простое хеширование строки (не криптографическое)
   * @param {string} str - Строка для хеширования
   * @returns {string} Hex хеш
   * @private
   */
  static #hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}