import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {

  // Загружаем переменные окружения
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = env.VITE_APP_ENV === 'development';
  const parentOrigin = env.VITE_PARENT_ORIGIN;
  const bffUrl = env.VITE_BFF_URL;

  return {
  plugins: [react()],
  server: {
    port: parseInt(env.VITE_APP_PORT),
    headers: {
        'Content-Security-Policy': [
          "default-src 'self'",
          isDev 
            ? "script-src 'self' 'unsafe-inline'"  // для dev
            : "script-src 'self'",                  // для prod
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          `connect-src 'self' ${bffUrl}`,          // динамически из env
          `frame-ancestors 'self' ${parentOrigin}`, // динамически из env
        ].join('; '),
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': `ALLOW-FROM ${parentOrigin}`,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      }
  },
  build: {
    target: 'es2015',
    minify: 'oxc',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('axios')) {
              return 'vendor-http';
            }
            return 'vendor';
          }
        }
      }
    }
  }
  }
});
