import { XSSProtection } from '../../utils/xssProtection';

/**
 * Навигация по вкладкам
 * 
 * Решает проблемы:
 * 1. Отображение доступных вкладок
 * 2. Подсветка активной вкладки
 * 3. Доступность (ARIA атрибуты)
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Массив конфигураций вкладок
 * @param {string} props.activeTab - ID активной вкладки
 * @param {Function} props.onTabChange - Обработчик смены вкладки
 */
const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className="tab-navigation" role="tablist" aria-label="Разделы расчета">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          className={`tab-button ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          <span className="tab-icon" aria-hidden="true">
            {XSSProtection.escapeHTML(tab.icon)}
          </span>
          <span className="tab-label">
            {XSSProtection.escapeHTML(tab.label)}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;