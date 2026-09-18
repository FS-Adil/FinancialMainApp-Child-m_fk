// /**
//  * Общая конфигурация приложения
//  * 
//  * Решает проблемы:
//  * 1. Централизованное управление настройками
//  * 2. Разные значения для dev/prod
//  */
// export const appConfig = {
//   id: 'app1',
//   // Название приложения
//   name: import.meta.env.VITE_APP_TITLE,
  
//   // Версия приложения
//   version: '1.0.0',
  
//   // BFF URL
//   bffUrl: import.meta.env.VITE_BFF_URL,
  
//   // API Key для BFF
//   bffApiKey: import.meta.env.VITE_BFF_API_KEY,
  
//   // Настройки родительского приложения
//   parent: {
//     // Ожидаемый origin родителя (для postMessage)
//     origin: import.meta.env.VITE_PARENT_ORIGIN,
//     // Время ожидания ответа от родителя (мс)
//     timeout: 10000
//   },
  
//   // Настройки безопасности
//   security: {
//     csrfEnabled: import.meta.env.VITE_CSRF_ENABLED,
//     fingerprintEnabled: import.meta.env.VITE_DEVICE_FINGERPRINT_ENABLED
//   }
// };

// export default appConfig;

/**
 * Общая конфигурация приложения
 * 
 * Решает проблемы:
 * 1. Централизованное управление настройками
 * 2. Разные значения для dev/prod
 * 3. Настройки для работы в iframe родителя
 */
export const appConfig = {
  // Уникальный идентификатор приложения
  // ВАЖНО: должен совпадать с ID в родительском childApps
  id: 'app1',
  
  // Название приложения
  name: import.meta.env.VITE_APP_TITLE || 'Cost Calculation App',
  
  // Версия приложения
  version: '1.0.0',
  
  // BFF URL
  bffUrl: import.meta.env.VITE_BFF_URL,
  
  // Настройки родительского приложения
  parent: {
    // Ожидаемый origin родителя (для postMessage)
    origin: import.meta.env.VITE_PARENT_ORIGIN,
    // Время ожидания ответа от родителя (мс)
    timeout: 10000,
    // Автоматически запрашивать авторизацию у родителя
    autoRequestAuth: true,
    // Задержка перед запросом авторизации (мс)
    authRequestDelay: 500
  },
  
  // Настройки авторизации
  authConfig: {
    // Имя ключа для хранения токена
    tokenKey: 'access_token',
    // Использовать авторизацию от родителя
    useParentAuth: true,
    // Ждать авторизацию от родителя перед запросами к BFF
    waitForParentAuth: true,
    // Не делать запросы к BFF пока ждем родителя
    skipBffWhenWaitingForParent: true,
    // Имя куки для токена
    cookieName: 'access_token',
    // Время жизни куки в секундах (15 минут)
    cookieMaxAge: 900,
    // Путь для куки
    cookiePath: '/',
    // SameSite политика для куки
    cookieSameSite: 'Lax'
  },
  
  // Настройки безопасности
  security: {
    csrfEnabled: import.meta.env.VITE_CSRF_ENABLED === 'true' || true,
    fingerprintEnabled: import.meta.env.VITE_DEVICE_FINGERPRINT_ENABLED === 'true' || false,
    // Проверять origin для postMessage
    validatePostMessageOrigin: true,
    // Максимальный размер сообщения postMessage (байты)
    maxMessageSize: 10000
  },
  
  // Настройки отладки
  debug: {
    // Логировать postMessage сообщения
    logPostMessages: import.meta.env.DEV || false,
    // Логировать авторизацию
    logAuth: import.meta.env.DEV || false,
    // Логировать запросы к BFF
    logBffRequests: import.meta.env.DEV || false
  }
};

export default appConfig;