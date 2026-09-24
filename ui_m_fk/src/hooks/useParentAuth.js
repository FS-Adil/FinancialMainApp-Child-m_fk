// useParentAuth.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSecurePostMessage } from './useSecurePostMessage';
import authService from '../services/authService';
import appConfig from '../config/app.config';

/**
 * Хук для авторизации через родительское приложение
 */
export const useParentAuth = () => {
  const [isInParent, setIsInParent] = useState(false);
  const [parentAuthLoading, setParentAuthLoading] = useState(true);
  const [parentAuthError, setParentAuthError] = useState(null);
  const [authData, setAuthData] = useState(null);
  const authRequestedRef = useRef(false);
  const messageProcessedRef = useRef(false);

  const { sendToParent, onParentMessage } = useSecurePostMessage({
    parentOrigin: appConfig.parent.origin
  });

  /**
   * Проверка, находимся ли мы в iframe родителя
   */
  useEffect(() => {
    const inIframe = window.parent !== window;
    setIsInParent(inIframe);
    
    if (inIframe) {
      console.log('📦 Приложение запущено в iframe родителя');
      
      // Отправляем сообщение о готовности родителю
      const readyMessage = { 
        type: 'CHILD_READY',
        app: appConfig.id || 'unknown-app',
        version: appConfig.version || '1.0.0'
      };
      
      sendToParent(readyMessage);
      
      // Запрашиваем авторизацию через небольшую задержку
      setTimeout(() => {
        if (!authRequestedRef.current) {
          authRequestedRef.current = true;
          console.log('🔐 Запрашиваю авторизацию у родителя...');
          sendToParent({ 
            type: 'CHILD_AUTH_REQUEST',
            app: appConfig.id || 'unknown-app'
          });
        }
      }, 500); // Увеличиваем задержку для надежности
    } else {
      console.log('🖥️ Приложение запущено standalone');
      setParentAuthLoading(false);
    }
  }, [sendToParent]);

  /**
   * Обработка сообщений от родителя
   */
  useEffect(() => {
    if (!isInParent) return;

    const cleanup = onParentMessage(async (data, origin) => {
      console.log('📨 Получено сообщение от родителя:', data.type);
      
      // Обрабатываем токен от родителя
      if (data.type === 'PARENT_AUTH_TOKEN') {
        // Проверяем, не обрабатывали ли мы уже это сообщение
        if (messageProcessedRef.current) {
          console.log('⚠️ Сообщение уже обработано, пропускаем');
          return;
        }
        
        messageProcessedRef.current = true;
        
        try {
          setParentAuthLoading(true);
          setParentAuthError(null);
          
          console.log('🔑 Получен токен авторизации от родителя');
          
          // // Сохраняем данные авторизации
          // const authInfo = {
          //   user: data.user,
          //   organization: data.organization,
          //   token: data.token,
          //   receivedAt: new Date().toISOString()
          // };
          
          // setAuthData(authInfo);
          
          // // Если есть токен, сохраняем его
          // if (data.token) {
          //   console.log('💾 Сохраняю токен:', data.token.substring(0, 20) + '...');
            
          //   // Сохраняем токен в localStorage
          //   localStorage.setItem('auth_token', data.token);
            
          //   // Устанавливаем куку с токеном
          //   document.cookie = `access_token=${data.token}; path=/; max-age=900; SameSite=Lax`;
            
          //   // Устанавливаем токен в заголовки axios/fetch
          //   if (authService.setToken) {
          //     authService.setToken(data.token);
          //   }
          // }

          // Обмениваем JWT родителя на BFF-сессию
          const result = await authService.loginViaParent(data.token);

          if (!result.success) {
            throw new Error('Не удалось создать BFF-сессию');
          }

          setAuthData({
            user: result.user,
            organization: result.organization,
            receivedAt: new Date().toISOString()
          });
          
          // Диспатчим событие с данными от родителя
          window.dispatchEvent(new CustomEvent('auth:login', { 
            detail: { 
              user: data.user, 
              organization: data.organization 
            }
          }));
          
          console.log('✅ Авторизация через родителя завершена');
          
        } catch (error) {
          console.error('❌ Ошибка обработки токена от родителя:', error);
          setParentAuthError('Ошибка авторизации через родителя');
        } finally {
          setParentAuthLoading(false);
        }
      }
      
      // Родитель запрашивает статус
      if (data.type === 'PARENT_STATUS_REQUEST') {
        sendToParent({ 
          type: 'CHILD_STATUS', 
          status: 'ready',
          app: appConfig.id || 'unknown-app',
          hasAuth: !!authData
        });
      }
      
      // Родитель уведомляет о выходе из системы
      if (data.type === 'PARENT_LOGOUT') {
        console.log('🚪 Родитель уведомил о выходе из системы');
        setAuthData(null);
        messageProcessedRef.current = false;
        localStorage.removeItem('auth_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    });

    return cleanup;
  }, [isInParent, sendToParent, onParentMessage, authData]);

  return {
    isInParent,
    parentAuthLoading,
    parentAuthError,
    authData,
    isAuthenticated: !!authData?.user
  };
};