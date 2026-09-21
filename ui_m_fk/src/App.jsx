// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import AppLayout from './components/layout/AppLayout';

// VITE_APP_BASE='/pkk/' → basename='/pkk' (без слэша на конце — требование React Router)
const BASE = import.meta.env.VITE_APP_BASE || '/';
const basename = BASE === '/' ? undefined : BASE.replace(/\/$/, '');

function App() {
  return (
    <Router basename={basename}>
      <AuthProvider>
        <Routes>
          {/* Редирект с корня */}
          <Route path="/" element={<Navigate to="/app" replace />} />
          
          {/* Защищенный маршрут */}
          <Route 
            path="/app/*"
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;