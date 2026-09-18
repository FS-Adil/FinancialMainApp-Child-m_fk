// // // authService.js
import bffApi, { tokenManager } from '../api/bffApi';
// // import { SecurityUtils } from '../utils/security';

// // /**
// //  * Сервис аутентификации
// //  */
// // class AuthService {
// //   /**
// //    * Вход по email и паролю
// //    */
// //   async login(email, password) {
// //     try {
// //       const sanitizedEmail = SecurityUtils.validateEmail(email);
// //       if (!sanitizedEmail) {
// //         return { 
// //           success: false, 
// //           error: 'Некорректный формат email' 
// //         };
// //       }

// //       const response = await bffApi.post('/api/auth/login', {
// //         email: sanitizedEmail,
// //         password: password
// //       });

// //       console.log('🔑 Login response:', response.data);

// //       // Проверяем, что ответ содержит необходимые данные
// //       if (!response.data?.user) {
// //         console.error('❌ No user data in response');
// //         return {
// //           success: false,
// //           error: 'Ошибка входа. Нет данных пользователя.'
// //         };
// //       }

// //       // Сохраняем данные пользователя
// //       tokenManager.saveUserData(response.data.user, response.data.organization);

// //       return {
// //         success: true,
// //         user: response.data.user,
// //         organization: response.data.organization
// //       };

// //     } catch (error) {
// //       console.error('❌ Login error:', error);
// //       return {
// //         success: false,
// //         error: error.response?.data?.error || 'Ошибка входа. Проверьте данные.'
// //       };
// //     }
// //   }

// //   /**
// //    * Авторизация через родительское приложение
// //    */
// //   async loginViaParent(parentToken) {
// //     try {
// //       const response = await bffApi.post('/api/auth/parent-session', {
// //         parentToken: parentToken
// //       });

// //       if (!response.data?.user) {
// //         return {
// //           success: false,
// //           error: 'Ошибка авторизации. Нет данных пользователя.'
// //         };
// //       }

// //       tokenManager.saveUserData(response.data.user, response.data.organization);

// //       return {
// //         success: true,
// //         user: response.data.user,
// //         organization: response.data.organization
// //       };

// //     } catch (error) {
// //       return {
// //         success: false,
// //         error: 'Не удалось авторизоваться через родительское приложение'
// //       };
// //     }
// //   }

// //   /**
// //    * Проверка текущей сессии
// //    */
// //   async checkSession() {
// //     try {
// //       const response = await bffApi.get('/api/auth/me');
      
// //       if (response.data?.user) {
// //         tokenManager.saveUserData(response.data.user, response.data.organization);
        
// //         return {
// //           success: true,
// //           user: response.data.user,
// //           organization: response.data.organization
// //         };
// //       }
      
// //       return {
// //         success: false,
// //         user: null,
// //         organization: null
// //       };

// //     } catch (error) {
// //       console.error('❌ Session check error:', error);
// //       return {
// //         success: false,
// //         user: null,
// //         organization: null
// //       };
// //     }
// //   }

// //   /**
// //    * Выход из системы
// //    */
// //   async logout() {
// //     try {
// //       await bffApi.post('/api/auth/logout');
// //     } catch (error) {
// //       console.error('Logout error:', error);
// //     }
    
// //     tokenManager.clearUserData();
    
// //     return { success: true };
// //   }
// // }

// // export default new AuthService();

// // authService.js
// import axios from 'axios';
// // import { bffApi } from './bffApi';
// import appConfig from '../config/app.config';

// class AuthService {
//   constructor() {
//     this.token = null;
//   }

//   /**
//    * Установка токена
//    */
//   setToken(token) {
//     this.token = token;
//     console.log('🔑 Токен установлен в authService');
    
//     // Устанавливаем заголовок Authorization для будущих запросов
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     } else {
//       delete axios.defaults.headers.common['Authorization'];
//     }
//   }

//   /**
//    * Проверка, нужно ли ждать авторизацию от родителя
//    */
//   shouldWaitForParentAuth() {
//     const inIframe = window.parent !== window;
//     const waitForParent = appConfig.authConfig?.waitForParentAuth !== false;
//     return inIframe && waitForParent;
//   }

//   /**
//    * Проверка сессии
//    */
//   async checkSession() {
//     // ВАЖНО: Если мы в iframe и должны ждать родителя, не делаем запрос
//     if (this.shouldWaitForParentAuth()) {
//       console.log('⏭️ Пропускаем проверку сессии, ждем данные от родителя');
//       return { success: false, skip: true };
//     }
    
//     try {
//       const response = await bffApi.get('/api/auth/me');
//       return {
//         success: true,
//         user: response.data.user,
//         organization: response.data.organization
//       };
//     } catch (error) {
//       if (error.response?.status === 401) {
//         return { success: false };
//       }
//       throw error;
//     }
//   }

//   /**
//    * Вход в систему
//    */
//   async login(email, password) {
//     try {
//       const response = await bffApi.post('/api/auth/login', { email, password });
      
//       if (response.data.token) {
//         this.setToken(response.data.token);
//       }
      
//       return {
//         success: true,
//         user: response.data.user,
//         organization: response.data.organization
//       };
//     } catch (error) {
//       return {
//         success: false,
//         error: error.response?.data?.message || 'Ошибка входа'
//       };
//     }
//   }

//   /**
//    * Вход через родителя
//    */
//   async loginViaParent(token) {
//     try {
//       this.setToken(token);
      
//       const response = await bffApi.get('/api/auth/me', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       return {
//         success: true,
//         user: response.data.user,
//         organization: response.data.organization
//       };
//     } catch (error) {
//       console.warn('BFF login via parent failed:', error);
//       return { success: false };
//     }
//   }

//   /**
//    * Выход из системы
//    */
//   async logout() {
//     try {
//       if (!this.shouldWaitForParentAuth()) {
//         await bffApi.post('/api/auth/logout');
//       }
//     } finally {
//       this.setToken(null);
//       localStorage.removeItem('auth_token');
//       document.cookie = 'access_token=; path=/; max-age=0';
//     }
//   }
// }

// export default new AuthService();

// authService.js
import axios from 'axios';
// import { bffApi } from './bffApi';
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
    
    // Устанавливаем заголовок Authorization для будущих запросов
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
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
        const response = await bffApi.get('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
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
  saveTokenFromParent(token) {
    if (!token) return;
    
    // Сохраняем в localStorage
    localStorage.setItem(appConfig.authConfig.tokenKey, token);
    
    // Устанавливаем куку
    const cookieOptions = [
      `path=${appConfig.authConfig.cookiePath || '/'}`,
      `max-age=${appConfig.authConfig.cookieMaxAge || 900}`,
      `SameSite=${appConfig.authConfig.cookieSameSite || 'Lax'}`
    ].join('; ');
    
    document.cookie = `${appConfig.authConfig.cookieName}=${token}; ${cookieOptions}`;
    
    // Устанавливаем токен в сервисе
    this.setToken(token);
    
    if (appConfig.debug.logAuth) {
      console.log('💾 Токен от родителя сохранен');
    }
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
  async loginViaParent(token) {
    try {
      this.saveTokenFromParent(token);
      
      const response = await bffApi.get('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return {
        success: true,
        user: response.data.user,
        organization: response.data.organization
      };
    } catch (error) {
      console.warn('BFF login via parent failed:', error);
      return { success: false };
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