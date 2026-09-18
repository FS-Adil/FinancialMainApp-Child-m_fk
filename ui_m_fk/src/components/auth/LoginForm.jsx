// LoginForm.jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SecurityUtils } from '../../utils/security';
import { XSSProtection } from '../../utils/xssProtection';

/**
 * Форма входа в систему
 */
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  const { login, error: authError, setError: setAuthError } = useAuth();

  /**
   * Валидация формы перед отправкой
   */
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!SecurityUtils.validateEmail(email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (!password) {
      newErrors.password = 'Пароль обязателен';
    } else if (password.length < 8) {
      newErrors.password = 'Пароль должен быть не менее 8 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Обработка отправки формы
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAuthError(null);

    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (result && !result.success) {
        console.error('Login failed:', result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Вход в систему</h2>
          <p className="login-subtitle">Расчет себестоимости товаров</p>
        </div>

        {authError && (
          <div className="error-banner" role="alert">
            <span className="error-banner-icon" aria-hidden="true">⚠️</span>
            {XSSProtection.escapeHTML(authError)}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={submitting}
              autoComplete="email"
              className={errors.email ? 'input-error' : ''}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="field-error" role="alert">
                {XSSProtection.escapeHTML(errors.email)}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              disabled={submitting}
              autoComplete="current-password"
              className={errors.password ? 'input-error' : ''}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="field-error" role="alert">
                {XSSProtection.escapeHTML(errors.password)}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="submit-btn"
          >
            {submitting ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;