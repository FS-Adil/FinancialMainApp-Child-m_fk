// bffApi.js
import axios from 'axios';

// ============================================
// ⚙️ НАСТРОЙКА
// ============================================
const isDev = import.meta.env.VITE_APP_ENV === 'development';

// ============================================
// 💾 IN-MEMORY STORAGE (без localStorage)
// ============================================
class MemoryStorage {
    constructor() {
        this.data = new Map();
    }

    getItem(key) {
        return this.data.get(key) || null;
    }

    setItem(key, value) {
        this.data.set(key, value);
        return true;
    }

    removeItem(key) {
        this.data.delete(key);
        return true;
    }

    clear() {
        this.data.clear();
    }
}

const memoryStorage = new MemoryStorage();

// ============================================
// 💾 ГЛОБАЛЬНОЕ ХРАНИЛИЩЕ (только в памяти)
// ============================================
if (!window.__BFF_USER_DATA__) {
    window.__BFF_USER_DATA__ = {
        user: null,
        organization: null,
        token: null,
        sessionId: null
    };
}

// ============================================
// 📤 AXIOS INSTANCE
// ============================================
const bffApi = axios.create({
    baseURL: import.meta.env.VITE_BFF_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    timeout: 30000
});

// ============================================
// 🚀 ПЕРЕХВАТЧИК ЗАПРОСОВ
// ============================================
bffApi.interceptors.request.use(
    (config) => {
        const token = window.__BFF_USER_DATA__.token || 
                     window.__BFF_USER_DATA__.sessionId;
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            config.headers['X-Session-Id'] = token;
        }
        
        if (isDev) {
            console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
            console.log('🔑 Token:', token ? `${token.substring(0, 10)}...` : 'none');
            console.log('🍪 Cookies:', config.withCredentials ? '✅ отправляются' : '❌ не отправляются');
        }
        
        return config;
    },
    (error) => {
        console.error('❌ Request error:', error.message);
        return Promise.reject(error);
    }
);

// ============================================
// 📥 ПЕРЕХВАТЧИК ОТВЕТОВ
// ============================================
bffApi.interceptors.response.use(
    (response) => {
        const sessionId = response.data?.token || 
                          response.headers['x-session-id'] ||
                          response.headers['session-id'];
        
        if (sessionId) {
            memoryStorage.setItem('sessionId', sessionId);
            window.__BFF_USER_DATA__.token = sessionId;
            window.__BFF_USER_DATA__.sessionId = sessionId;
            
            if (isDev) {
                console.log('💾 Session ID in memory:', sessionId.substring(0, 10) + '...');
            }
        }
        
        if (response.data?.user) {
            window.__BFF_USER_DATA__.user = response.data.user;
        }
        if (response.data?.organization) {
            window.__BFF_USER_DATA__.organization = response.data.organization;
        }
        
        return response;
    },
    async (error) => {
        if (error.response?.status === 401) {
            console.error('🔒 Unauthorized - session expired');
            
            window.__BFF_USER_DATA__.token = null;
            window.__BFF_USER_DATA__.sessionId = null;
            window.__BFF_USER_DATA__.user = null;
            window.__BFF_USER_DATA__.organization = null;
            memoryStorage.removeItem('sessionId');
            
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
        return Promise.reject(error);
    }
);

// ============================================
// 🔧 API МЕТОДЫ
// ============================================
export const tokenManager = {
    saveUserData: (user, organization) => {
        if (user) {
            window.__BFF_USER_DATA__.user = user;
        }
        if (organization) {
            window.__BFF_USER_DATA__.organization = organization;
        }
        console.log('💾 User data saved');
    },
    
    getUserData: () => ({
        user: window.__BFF_USER_DATA__.user,
        organization: window.__BFF_USER_DATA__.organization
    }),
    
    clearUserData: () => {
        window.__BFF_USER_DATA__.user = null;
        window.__BFF_USER_DATA__.organization = null;
        window.__BFF_USER_DATA__.token = null;
        window.__BFF_USER_DATA__.sessionId = null;
        memoryStorage.removeItem('sessionId');
        console.log('🧹 All data cleared');
    },
    
    getToken: () => {
        return window.__BFF_USER_DATA__.token || 
               window.__BFF_USER_DATA__.sessionId || 
               memoryStorage.getItem('sessionId');
    },
    
    setToken: (token) => {
        memoryStorage.setItem('sessionId', token);
        window.__BFF_USER_DATA__.token = token;
        window.__BFF_USER_DATA__.sessionId = token;
        console.log('🔑 Token set');
    },
    
    updateUser: (user) => {
        window.__BFF_USER_DATA__.user = { 
            ...window.__BFF_USER_DATA__.user, 
            ...user 
        };
        console.log('🔄 User updated');
    },
    
    isAuthenticated: () => {
        return !!(window.__BFF_USER_DATA__.token || 
                 window.__BFF_USER_DATA__.sessionId || 
                 memoryStorage.getItem('sessionId'));
    }
};

export default bffApi;