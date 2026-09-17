import { useAuth } from '../../contexts/AuthContext';
import { XSSProtection } from '../../utils/xssProtection';

/**
 * Шапка приложения с информацией об организации
 * 
 * Решает проблемы:
 * 1. Отображение названия организации (из контекста)
 * 2. Отображение email пользователя
 * 3. Кнопка выхода из системы
 * 
 * Безопасность: Все данные экранируются через XSSProtection
 */
const OrganizationHeader = () => {
  const { user, organization, logout } = useAuth();

  /**
   * Обработчик выхода
   */
  const handleLogout = async () => {
    await logout();
    // После выхода AuthGuard покажет форму входа
  };

  return (
    <header className="org-header">
      <div className="org-header-left">
        {/* Название организации */}
        <h1 className="org-name">
          {organization?.name 
            ? XSSProtection.escapeHTML(organization.name) 
            : 'Расчет себестоимости'}
        </h1>
        {/* {organization?.inn && (
          <span className="org-inn">
            ИНН: {XSSProtection.escapeHTML(organization.inn)}
          </span>
        )} */}
      </div>

      <div className="org-header-right">
        {/* Информация о пользователе */}
        <div className="user-info">
          <span className="user-email" title={user?.email}>
            {user?.email ? XSSProtection.escapeHTML(user.email) : ''}
          </span>
          {user?.role && (
            <span className="user-role">
              {XSSProtection.escapeHTML(user.role)}
            </span>
          )}
        </div>

        {/* Кнопка выхода */}
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title="Выйти из системы"
          type="button"
        >
          Выйти
        </button>
      </div>
    </header>
  );
};

export default OrganizationHeader;