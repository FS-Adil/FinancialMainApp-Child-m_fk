import { useState, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSortedTabs } from '../../config/tabs.config';
import TabNavigation from './TabNavigation';
import LoadingSpinner from '../shared/LoadingSpinner';

/**
 * 📦 СИСТЕМА ВКЛАДОК
 * 
 * Решает проблемы:
 * 1. Автоматический рендеринг вкладок из конфигурации
 * 2. Ленивая загрузка компонентов вкладок (code splitting)
 * 3. Фильтрация вкладок по роли пользователя
 * 4. Управление активной вкладкой
 * 
 * ДЛЯ ДОБАВЛЕНИЯ НОВОЙ ВКЛАДКИ:
 * 1. Создайте компонент в components/tabs/
 * 2. Добавьте запись в config/tabs.config.js
 * 3. ГОТОВО! Вкладка появится автоматически
 */
const TabSystem = () => {
  const [activeTab, setActiveTab] = useState(null);
  const { user } = useAuth();

  // Получаем вкладки, доступные пользователю с учетом роли
  const availableTabs = getSortedTabs(user?.role);

  // Если нет доступных вкладок
  if (availableTabs.length === 0) {
    return (
      <div className="tab-system-empty">
        <p>Нет доступных разделов</p>
      </div>
    );
  }

  // Устанавливаем первую вкладку активной по умолчанию
  if (!activeTab || !availableTabs.find(t => t.id === activeTab)) {
    const firstTab = availableTabs[0];
    if (firstTab && firstTab.id !== activeTab) {
      setActiveTab(firstTab.id);
    }
  }

  // Находим конфигурацию активной вкладки
  const currentTab = availableTabs.find(tab => tab.id === activeTab);

  return (
    <div className="tab-system">
      {/* Навигация по вкладкам */}
      <TabNavigation
        tabs={availableTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Контент активной вкладки */}
      <div 
        className="tab-content"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        <Suspense fallback={<LoadingSpinner message="Загрузка раздела..." />}>
          {currentTab && <currentTab.component key={currentTab.id} />}
        </Suspense>
      </div>
    </div>
  );
};

export default TabSystem;