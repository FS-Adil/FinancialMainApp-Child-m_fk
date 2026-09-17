// // // AuthContext.jsx
// // import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// // import authService from '../services/authService';

// // /**
// //  * Контекст авторизации
// //  * Работает через HttpOnly cookies
// //  */
// // const AuthContext = createContext(null);

// // export const AuthProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [organization, setOrganization] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   /**
// //    * Проверка сессии при загрузке приложения
// //    * BFF автоматически проверит cookie session_id
// //    */
// //   useEffect(() => {
// //     const checkSession = async () => {
// //       try {
// //         console.log('🔍 Checking session via cookie...');
// //         const result = await authService.checkSession();
        
// //         if (result.success) {
// //           setUser(result.user);
// //           setOrganization(result.organization);
// //           console.log('✅ Session valid');
// //         } else {
// //           console.log('ℹ️ No valid session');
// //         }
// //       } catch (err) {
// //         console.error('❌ Session check failed:', err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     checkSession();
// //   }, []);

// //   /**
// //    * Обработка события истечения сессии
// //    */
// //   useEffect(() => {
// //     const handleSessionExpired = () => {
// //       console.log('🔒 Session expired event received');
// //       setUser(null);
// //       setOrganization(null);
// //       setError('Сессия истекла. Пожалуйста, войдите снова.');
// //     };

// //     window.addEventListener('auth:session-expired', handleSessionExpired);
    
// //     return () => {
// //       window.removeEventListener('auth:session-expired', handleSessionExpired);
// //     };
// //   }, []);

// //   /**
// //    * Вход в систему
// //    */
// //   const login = useCallback(async (email, password) => {
// //     setError(null);
// //     setLoading(true);

// //     try {
// //       const result = await authService.login(email, password);
      
// //       if (result.success) {
// //         setUser(result.user);
// //         setOrganization(result.organization);
// //         console.log('✅ Login successful');
// //         return { success: true };
// //       } else {
// //         setError(result.error);
// //         return { success: false, error: result.error };
// //       }
// //     } catch (err) {
// //       const errorMessage = 'Ошибка входа. Попробуйте позже.';
// //       setError(errorMessage);
// //       return { success: false, error: errorMessage };
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, []);

// //   /**
// //    * Выход из системы
// //    */
// //   const logout = useCallback(async () => {
// //     try {
// //       await authService.logout();
// //     } finally {
// //       setUser(null);
// //       setOrganization(null);
// //       setError(null);
// //     }
// //   }, []);

// //   const value = {
// //     user,
// //     organization,
// //     loading,
// //     error,
// //     isAuthenticated: !!user,
// //     login,
// //     logout,
// //     setError
// //   };

// //   return (
// //     <AuthContext.Provider value={value}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // /**
// //  * Хук для использования контекста авторизации
// //  */
// // export const useAuth = () => {
// //   const context = useContext(AuthContext);
// //   if (!context) {
// //     throw new Error('useAuth must be used within AuthProvider');
// //   }
// //   return context;
// // };

// // export default AuthContext;

// // AuthContext.jsx
// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import authService from '../services/authService';
// import { useParentAuth } from '../hooks/useParentAuth';

// /**
//  * Контекст авторизации
//  * Работает через HttpOnly cookies и поддерживает авторизацию от родителя
//  */
// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [organization, setOrganization] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Подключаем родительскую авторизацию
//   const { 
//     isInParent, 
//     parentAuthLoading, 
//     parentAuthError,
//     authData 
//   } = useParentAuth();

//   /**
//    * Обработка события авторизации от родителя
//    */
//   useEffect(() => {
//     const handleParentAuth = (event) => {
//       const { user: parentUser, organization: parentOrg } = event.detail;
      
//       if (parentUser) {
//         console.log('✅ Получены данные авторизации от родителя');
//         setUser(parentUser);
//         setOrganization(parentOrg);
//         setLoading(false);
//       }
//     };

//     window.addEventListener('auth:login', handleParentAuth);
    
//     return () => {
//       window.removeEventListener('auth:login', handleParentAuth);
//     };
//   }, []);

//   /**
//    * Проверка сессии при загрузке приложения
//    * BFF автоматически проверит cookie session_id
//    */
//   useEffect(() => {
//     const checkSession = async () => {
//       // Если мы в iframe родителя и получили данные авторизации
//       if (isInParent && authData?.user) {
//         console.log('👤 Используем данные авторизации от родителя');
//         setUser(authData.user);
//         setOrganization(authData.organization);
//         setLoading(false);
//         return;
//       }
      
//       // Если мы в iframe родителя, но еще ждем данные
//       if (isInParent && parentAuthLoading) {
//         console.log('⏳ Ожидаем данные авторизации от родителя...');
//         setLoading(true);
//         return;
//       }
      
//       // Обычная проверка сессии через BFF
//       try {
//         console.log('🔍 Checking session via cookie...');
//         const result = await authService.checkSession();
        
//         if (result.success) {
//           setUser(result.user);
//           setOrganization(result.organization);
//           console.log('✅ Session valid');
//         } else {
//           console.log('ℹ️ No valid session');
//         }
//       } catch (err) {
//         console.error('❌ Session check failed:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkSession();
//   }, [isInParent, parentAuthLoading, authData]);

//   /**
//    * Обработка события истечения сессии
//    */
//   useEffect(() => {
//     const handleSessionExpired = () => {
//       console.log('🔒 Session expired event received');
//       setUser(null);
//       setOrganization(null);
//       setError('Сессия истекла. Пожалуйста, войдите снова.');
//     };

//     window.addEventListener('auth:session-expired', handleSessionExpired);
    
//     return () => {
//       window.removeEventListener('auth:session-expired', handleSessionExpired);
//     };
//   }, []);

//   /**
//    * Вход в систему
//    */
//   const login = useCallback(async (email, password) => {
//     setError(null);
//     setLoading(true);

//     try {
//       const result = await authService.login(email, password);
      
//       if (result.success) {
//         setUser(result.user);
//         setOrganization(result.organization);
//         console.log('✅ Login successful');
//         return { success: true };
//       } else {
//         setError(result.error);
//         return { success: false, error: result.error };
//       }
//     } catch (err) {
//       const errorMessage = 'Ошибка входа. Попробуйте позже.';
//       setError(errorMessage);
//       return { success: false, error: errorMessage };
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   /**
//    * Выход из системы
//    */
//   const logout = useCallback(async () => {
//     try {
//       await authService.logout();
      
//       // Если мы в родителе, уведомляем его о выходе
//       if (isInParent) {
//         window.parent.postMessage({ 
//           type: 'CHILD_LOGOUT',
//           timestamp: Date.now()
//         }, '*');
//       }
//     } finally {
//       setUser(null);
//       setOrganization(null);
//       setError(null);
//     }
//   }, [isInParent]);

//   const value = {
//     user,
//     organization,
//     loading: loading || parentAuthLoading,
//     error: error || parentAuthError,
//     isAuthenticated: !!user,
//     login,
//     logout,
//     setError,
//     isInParent
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// /**
//  * Хук для использования контекста авторизации
//  */
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within AuthProvider');
//   }
//   return context;
// };

// export default AuthContext;

// AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';
import { useParentAuth } from '../hooks/useParentAuth';

/**
 * Контекст авторизации
 * Работает через HttpOnly cookies и поддерживает авторизацию от родителя
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bffRequestMadeRef = useRef(false); // Отслеживаем, делали ли мы запрос к BFF
  
  // Подключаем родительскую авторизацию
  const { 
    isInParent, 
    parentAuthLoading, 
    parentAuthError,
    authData 
  } = useParentAuth();

  /**
   * Обработка события авторизации от родителя
   */
  useEffect(() => {
    const handleParentAuth = (event) => {
      const { user: parentUser, organization: parentOrg } = event.detail;
      
      if (parentUser) {
        console.log('✅ Получены данные авторизации от родителя');
        setUser(parentUser);
        setOrganization(parentOrg);
        setLoading(false);
      }
    };

    window.addEventListener('auth:login', handleParentAuth);
    
    return () => {
      window.removeEventListener('auth:login', handleParentAuth);
    };
  }, []);

  /**
   * Проверка сессии при загрузке приложения
   */
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔄 Начало проверки сессии', { isInParent, parentAuthLoading, hasAuthData: !!authData });
      
      // ВАЖНО: Если мы в iframe родителя
      if (isInParent) {
        console.log('📦 Мы в iframe родителя');
        
        // Если уже получили данные от родителя
        if (authData?.user) {
          console.log('👤 Используем данные авторизации от родителя');
          setUser(authData.user);
          setOrganization(authData.organization);
          setLoading(false);
          return;
        }
        
        // Если еще ждем данные от родителя
        if (parentAuthLoading) {
          console.log('⏳ Ждем данные авторизации от родителя...');
          setLoading(true);
          return; // НЕ делаем запрос к BFF
        }
        
        // Если родитель не предоставил данные и мы их уже ждали
        if (!parentAuthLoading && !authData?.user && bffRequestMadeRef.current === false) {
          console.log('⚠️ Родитель не предоставил данные, пробуем обычную сессию');
          bffRequestMadeRef.current = true;
          // Продолжаем выполнение для обычной проверки
        } else if (bffRequestMadeRef.current === true) {
          // Уже делали запрос к BFF, не повторяем
          console.log('🔄 Запрос к BFF уже был сделан, ждем...');
          setLoading(false);
          return;
        }
      } else {
        console.log('🖥️ Standalone режим, проверяем сессию');
      }
      
      // Обычная проверка сессии через BFF (только для standalone режима)
      try {
        console.log('🔍 Checking session via cookie...');
        const result = await authService.checkSession();
        
        if (result.success) {
          setUser(result.user);
          setOrganization(result.organization);
          console.log('✅ Session valid');
        } else {
          console.log('ℹ️ No valid session');
        }
      } catch (err) {
        console.error('❌ Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [isInParent, parentAuthLoading, authData]);

  /**
   * Обработка события истечения сессии
   */
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log('🔒 Session expired event received');
      setUser(null);
      setOrganization(null);
      setError('Сессия истекла. Пожалуйста, войдите снова.');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, []);

  /**
   * Вход в систему
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        setUser(result.user);
        setOrganization(result.organization);
        console.log('✅ Login successful');
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = 'Ошибка входа. Попробуйте позже.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Выход из системы
   */
  const logout = useCallback(async () => {
    try {
      if (!isInParent) {
        await authService.logout();
      }
      
      // Если мы в родителе, уведомляем его о выходе
      if (isInParent) {
        window.parent.postMessage({ 
          type: 'CHILD_LOGOUT',
          timestamp: Date.now()
        }, '*');
      }
    } finally {
      setUser(null);
      setOrganization(null);
      setError(null);
      localStorage.removeItem('auth_token');
      document.cookie = 'access_token=; path=/; max-age=0';
    }
  }, [isInParent]);

  const value = {
    user,
    organization,
    loading: loading || parentAuthLoading,
    error: error || parentAuthError,
    isAuthenticated: !!user,
    login,
    logout,
    setError,
    isInParent
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Хук для использования контекста авторизации
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;