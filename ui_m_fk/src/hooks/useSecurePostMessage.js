// import { useEffect, useRef, useCallback } from 'react';
// import { PostMessageSecurity } from '../utils/postMessageSecurity';

// /**
//  * Хук для безопасной работы с postMessage
//  * 
//  * Решает проблемы:
//  * 1. Проверка origin родительского приложения
//  * 2. Безопасная отправка и получение сообщений
//  * 3. Автоматическая очистка подписок
//  * 
//  * @param {Object} options - Настройки
//  * @param {string} options.parentOrigin - Ожидаемый origin родителя
//  * @returns {{ sendToParent: Function, onParentMessage: Function }}
//  */
// export const useSecurePostMessage = (options = {}) => {
//   const securityRef = useRef(null);
//   const cleanupRef = useRef(null);

//   // Инициализация безопасности
//   useEffect(() => {
//     securityRef.current = new PostMessageSecurity();
    
//     // Добавляем разрешенные origins
//     if (options.parentOrigin) {
//       securityRef.current.addAllowedOrigin(options.parentOrigin);
//     }
    
//     // Для разработки добавляем localhost
//     if (import.meta.env.DEV) {
//       securityRef.current.addAllowedOrigin(window.location.origin);
//     //   securityRef.current.addAllowedOrigin('http://localhost:3000');
//     }

//     return () => {
//       // Очищаем подписки при размонтировании
//       if (cleanupRef.current) {
//         cleanupRef.current();
//       }
//     };
//   }, [options.parentOrigin]);

//   /**
//    * Отправка сообщения родительскому окну
//    */
//   const sendToParent = useCallback((message) => {
//     if (!window.parent || window.parent === window) {
//       console.warn('PostMessage: No parent window');
//       return false;
//     }

//     if (!securityRef.current) return false;

//     // Определяем целевой origin
//     const targetOrigin = options.parentOrigin || '*';
    
//     return securityRef.current.sendSecureMessage(
//       window.parent,
//       message,
//       targetOrigin
//     );
//   }, [options.parentOrigin]);

//   /**
//    * Подписка на сообщения от родителя
//    * @param {Function} handler - Обработчик сообщений
//    * @returns {Function} Функция для отписки
//    */
//   const onParentMessage = useCallback((handler) => {
//     if (!securityRef.current) return () => {};

//     // Очищаем предыдущую подписку
//     if (cleanupRef.current) {
//       cleanupRef.current();
//     }

//     // Создаем новую подписку
//     cleanupRef.current = securityRef.current.onMessage((data, origin) => {
//       handler(data, origin);
//     });

//     return cleanupRef.current;
//   }, []);

//   return {
//     sendToParent,
//     onParentMessage
//   };
// };

// useSecurePostMessage.js
import { useEffect, useRef, useCallback } from 'react';
import { PostMessageSecurity } from '../utils/postMessageSecurity';

/**
 * Хук для безопасной работы с postMessage
 * 
 * Решает проблемы:
 * 1. Проверка origin родительского приложения
 * 2. Безопасная отправка и получение сообщений
 * 3. Автоматическая очистка подписок
 * 4. Логирование для отладки
 * 
 * @param {Object} options - Настройки
 * @param {string} options.parentOrigin - Ожидаемый origin родителя
 * @returns {{ sendToParent: Function, onParentMessage: Function }}
 */
export const useSecurePostMessage = (options = {}) => {
  const securityRef = useRef(null);
  const cleanupRef = useRef(null);
  const messageQueueRef = useRef([]);

  // Инициализация безопасности
  useEffect(() => {
    securityRef.current = new PostMessageSecurity();
    
    // Добавляем разрешенные origins
    if (options.parentOrigin) {
      securityRef.current.addAllowedOrigin(options.parentOrigin);
      console.log('🔒 Разрешен origin родителя:', options.parentOrigin);
    }
    
    // Для разработки добавляем localhost варианты
    if (import.meta.env.DEV) {
      securityRef.current.addAllowedOrigin(window.location.origin);
      securityRef.current.addAllowedOrigin('http://localhost:3000');
      securityRef.current.addAllowedOrigin('http://localhost:5173');
      securityRef.current.addAllowedOrigin('http://localhost:8080');
      console.log('🔧 Dev mode: добавлены localhost origins');
    }

    // Отправляем очередь сообщений, если есть
    if (messageQueueRef.current.length > 0) {
      console.log('📤 Отправка отложенных сообщений:', messageQueueRef.current.length);
      messageQueueRef.current.forEach(msg => {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(msg.message, msg.targetOrigin);
        }
      });
      messageQueueRef.current = [];
    }

    return () => {
      // Очищаем подписки при размонтировании
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [options.parentOrigin]);

  /**
   * Отправка сообщения родительскому окну
   */
  const sendToParent = useCallback((message) => {
    if (!window.parent || window.parent === window) {
      console.warn('PostMessage: No parent window');
      return false;
    }

    if (!securityRef.current) {
      console.warn('PostMessage: Security not initialized');
      return false;
    }

    // Определяем целевой origin
    const targetOrigin = options.parentOrigin || '*';
    
    const result = securityRef.current.sendSecureMessage(
      window.parent,
      message,
      targetOrigin
    );
    
    if (result) {
      console.log('📤 Отправлено сообщение родителю:', message.type);
    } else {
      console.error('❌ Не удалось отправить сообщение родителю:', message.type);
    }
    
    return result;
  }, [options.parentOrigin]);

  /**
   * Подписка на сообщения от родителя
   * @param {Function} handler - Обработчик сообщений
   * @returns {Function} Функция для отписки
   */
  const onParentMessage = useCallback((handler) => {
    if (!securityRef.current) {
      console.warn('PostMessage: Security not initialized');
      return () => {};
    }

    // Очищаем предыдущую подписку
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Создаем новую подписку
    cleanupRef.current = securityRef.current.onMessage((data, origin) => {
      console.log('📨 Получено сообщение от родителя:', data.type, 'from:', origin);
      handler(data, origin);
    });

    return cleanupRef.current;
  }, []);

  return {
    sendToParent,
    onParentMessage
  };
};