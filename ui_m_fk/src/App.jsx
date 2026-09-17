// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <Router>
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