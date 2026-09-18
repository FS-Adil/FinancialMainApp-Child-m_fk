// AuthGuard.jsx
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../shared/LoadingSpinner';
import LoginForm from './LoginForm';

/**
 * Защитник маршрутов
 */
const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Показываем загрузку при проверке сессии
  if (loading) {
    return (
      <div className="auth-guard-loading">
        <LoadingSpinner message="Проверка авторизации..." />
      </div>
    );
  }

  // Если не авторизован - показываем форму входа
  if (!isAuthenticated) {
    return (
      <div className="auth-guard-login">
        <LoginForm />
      </div>
    );
  }

  // Авторизован - показываем защищенный контент
  return children;
};

export default AuthGuard;