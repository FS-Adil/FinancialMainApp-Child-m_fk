/**
 * Компонент индикатора загрузки
 * 
 * Решает проблему: Пользователь видит, что данные загружаются,
 * а не зависшее приложение.
 * 
 * @param {Object} props
 * @param {string} props.message - Сообщение при загрузке
 */
const LoadingSpinner = ({ message = 'Загрузка...' }) => {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="loading-message">{message}</p>
    </div>
  );
};

export default LoadingSpinner;