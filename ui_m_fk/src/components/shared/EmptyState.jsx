/**
 * Компонент пустого состояния
 * 
 * Решает проблему: Пользователь понимает, что данных нет,
 * а не что произошла ошибка загрузки.
 * 
 * @param {Object} props
 * @param {string} props.message - Сообщение
 */
const EmptyState = ({ message = 'Нет данных для отображения' }) => {
  return (
    <div className="empty-container">
      <div className="empty-icon" aria-hidden="true">📭</div>
      <p className="empty-message">{message}</p>
    </div>
  );
};

export default EmptyState;