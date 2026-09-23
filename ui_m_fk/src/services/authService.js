// // // authService.js
import bffApi, { tokenManager } from '../api/bffApi';

import axios from 'axios';
import appConfig from '../config/app.config';

class AuthService {
  constructor() {
    this.token = null;
    this.isWaitingForParentAuth = false;
  }

  /**
   * Установка токена
   */
  setToken(token) {
    this.token = token;
    if (appConfig.debug.logAuth) {
      console.log('🔑 Токен установлен в authService');
    }
    if (token) {
      tokenManager.setToken(token);   // ← пишем в bffApi
    } else {
      tokenManager.clearUserData();
    }
    // УБРАЛИ axios.defaults.headers.common — он ломает другие API
  }

  /**
   * Установка флага ожидания авторизации от родителя
   */
  setWaitingForParentAuth(waiting) {
    this.isWaitingForParentAuth = waiting;
    
    if (appConfig.debug.logAuth) {
      console.log(`⏳ Ожидание авторизации от родителя: ${waiting ? 'да' : 'нет'}`);
    }
  }

  /**
   * Проверка, нужно ли ждать авторизацию от родителя
   */
  shouldWaitForParentAuth() {
    const inIframe = window.parent !== window;
    const waitForParent = appConfig.authConfig?.waitForParentAuth !== false;
    const useParentAuth = appConfig.authConfig?.useParentAuth !== false;
    
    return inIframe && waitForParent && useParentAuth;
  }

  /**
   * Проверка, нужно ли пропускать запросы к BFF
   */
  shouldSkipBffRequest() {
    const skipWhenWaiting = appConfig.authConfig?.skipBffWhenWaitingForParent !== false;
    return this.isWaitingForParentAuth && skipWhenWaiting;
  }

  /**
   * Проверка сессии
   */
  async checkSession() {
    // ВАЖНО: Если мы в iframe и должны ждать родителя, не делаем запрос
    if (this.shouldWaitForParentAuth() && !this.token) {
      if (appConfig.debug.logAuth) {
        console.log('⏭️ Пропускаем проверку сессии, ждем данные от родителя');
      }
      return { success: false, skip: true };
    }
    
    // Если у нас есть токен от родителя, используем его
    if (this.token) {
      try {
        const response = await bffApi.get('/api/auth/me');
        // const response = await bffApi.get('/api/auth/me', {
        //   headers: {
        //     'Authorization': `Bearer ${this.token}`
        //   }
        // });
        
        return {
          success: true,
          user: response.data.user,
          organization: response.data.organization
        };
      } catch (error) {
        if (error.response?.status === 401) {
          // Токен недействителен
          this.setToken(null);
          return { success: false };
        }
        throw error;
      }
    }
    
    // Обычная проверка сессии через cookies
    try {
      const response = await bffApi.get('/api/auth/me');
      return {
        success: true,
        user: response.data.user,
        organization: response.data.organization
      };
    } catch (error) {
      if (error.response?.status === 401) {
        return { success: false };
      }
      throw error;
    }
  }

  /**
   * Сохранение токена от родителя
   */
  saveTokenFromParent(sessionId) {
    // Никаких localStorage и document.cookie.
    // BFF-сессия живёт только в памяти (window.__BFF_USER_DATA__).
    this.setToken(sessionId);
  }

  /**
   * Очистка токена
   */
  clearToken() {
    this.setToken(null);
    localStorage.removeItem(appConfig.authConfig.tokenKey);
    
    // Очищаем куку
    document.cookie = `${appConfig.authConfig.cookieName}=; path=/; max-age=0`;
    
    if (appConfig.debug.logAuth) {
      console.log('🗑️ Токен очищен');
    }
  }

  /**
   * Вход в систему
   */
  async login(email, password) {
    try {
      const response = await bffApi.post('/api/auth/login', { email, password });
      
      if (response.data.token) {
        this.saveTokenFromParent(response.data.token);
      }
      
      return {
        success: true,
        user: response.data.user,
        organization: response.data.organization
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Ошибка входа'
      };
    }
  }

  /**
   * Вход через родителя
   */
  async loginViaParent(parentJwt) {
    try {
      // 1. Обмен JWT родителя на BFF-сессию
      const res = await bffApi.post('/api/auth/parent-session', {
        parentToken: parentJwt
      });

      if (!res.data?.token) {
        throw new Error('BFF не вернул session token');
      }

      // 2. Сохраняем sessionId (НЕ JWT!) — он уйдёт в window.__BFF_USER_DATA__
      this.setToken(res.data.token);
      tokenManager.saveUserData(res.data.user, res.data.organization);

      return {
        success: true,
        user: res.data.user,
        organization: res.data.organization
      };
    } catch (error) {
      console.warn('BFF login via parent failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Выход из системы
   */
  async logout() {
    try {
      if (!this.shouldWaitForParentAuth() || this.token) {
        await bffApi.post('/api/auth/logout');
      }
    } finally {
      this.clearToken();
    }
  }
}

export default new AuthService();