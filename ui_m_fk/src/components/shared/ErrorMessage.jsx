/**
 * Компонент отображения ошибки
 * 
 * Решает проблемы:
 * 1. Понятное сообщение об ошибке для пользователя
 * 2. Возможность повторить действие
 * 
 * @param {Object} props
 * @param {string} props.message - Сообщение об ошибке
 * @param {Function} props.onRetry - Функция повтора (опционально)
 */
const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-container" role="alert">
      <div className="error-icon" aria-hidden="true">⚠️</div>
      <h3 className="error-title">Произошла ошибка</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button 
          className="error-retry-btn"
          onClick={onRetry}
          type="button"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;