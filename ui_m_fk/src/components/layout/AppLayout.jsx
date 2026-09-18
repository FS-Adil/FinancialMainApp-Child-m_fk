import OrganizationHeader from './OrganizationHeader';
import TabSystem from '../tabs/TabSystem';

/**
 * Основной layout приложения
 * 
 * Решает проблемы:
 * 1. Единая структура всех страниц
 * 2. Шапка с информацией об организации
 * 3. Система вкладок для разных расчетов
 */
const AppLayout = () => {
  return (
    <div className="app-layout">
      {/* Шапка с организацией и пользователем */}
      <OrganizationHeader />
      
      {/* Основной контент - система вкладок */}
      <main className="app-main">
        <TabSystem />
      </main>
    </div>
  );
};

export default AppLayout;