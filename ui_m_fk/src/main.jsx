// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}


// Без StrictMode для избежания двойного монтирования
ReactDOM.createRoot(rootElement).render(
  <App />
);