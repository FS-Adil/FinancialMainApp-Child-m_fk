/**
 * 📦 КОНФИГУРАЦИЯ ВКЛАДОК
 * 
 * Решает проблемы:
 * 1. Централизованное управление вкладками
 * 2. Ленивая загрузка (code splitting)
 * 3. Контроль доступа по ролям
 * 4. Простое добавление новых вкладок
 * 
 * ДЛЯ ДОБАВЛЕНИЯ НОВОЙ ВКЛАДКИ:
 * 1. Скопируйте _template/NewFeatureTab.jsx
 * 2. Создайте свой компонент
 * 3. Добавьте запись в массив ниже
 * 4. Вкладка появится автоматически в UI!
 */

import { lazy } from 'react';

/**
 * Конфигурация всех вкладок приложения
 * 
 * Поля:
 * - id: Уникальный идентификатор вкладки
 * - label: Название вкладки (отображается в UI)
 * - icon: Иконка (emoji или символ)
 * - component: Ленивая загрузка компонента
 * - requireAuth: Требуется ли авторизация
 * - allowedRoles: Роли, которым доступна вкладка ([] = всем)
 * - order: Порядок сортировки
 */
export const tabsConfig = [
  {
    id: 'sales-cost',
    label: 'Себестоимость продаж',
    icon: '💰',
    description: 'Расчет себестоимости проданных товаров за период',
    component: lazy(() => import('../components/tabs/sales-cost/SalesCostTab')),
    requireAuth: true,
    allowedRoles: [], // Доступно всем ролям
    order: 1
  },
  {
    id: 'stock-cost',
    label: 'Себестоимость остатков',
    icon: '📦',
    description: 'Расчет себестоимости остатков товаров на дату',
    component: lazy(() => import('../components/tabs/stock-cost/StockCostTab')),
    requireAuth: true,
    allowedRoles: [], // Доступно всем ролям
    order: 2
  },
  
  // ==========================================
  // 📋 ШАБЛОН ДЛЯ ДОБАВЛЕНИЯ НОВОЙ ВКЛАДКИ
  // ==========================================
  // Раскомментируйте и настройте под свою функцию:
  /*
  {
    id: 'margin-analysis',
    label: 'Маржинальный анализ',
    icon: '📊',
    description: 'Анализ маржинальности продаж',
    component: lazy(() => import('../components/tabs/margin-analysis/MarginAnalysisTab')),
    requireAuth: true,
    allowedRoles: ['admin', 'manager'], // Только для admin и manager
    order: 3
  },
  */
];

/**
 * Получение отсортированных вкладок с фильтрацией по роли
 * 
 * @param {string} userRole - Роль текущего пользователя
 * @returns {Array} Отфильтрованные и отсортированные вкладки
 */
export const getSortedTabs = (userRole) => {
  return tabsConfig
    .filter(tab => {
      // Если не требуется авторизация - показываем всем
      if (!tab.requireAuth) return true;
      
      // Если указаны конкретные роли - проверяем доступ
      if (tab.allowedRoles.length > 0) {
        return tab.allowedRoles.includes(userRole);
      }
      
      // Если роли не указаны - доступно всем авторизованным
      return true;
    })
    .sort((a, b) => a.order - b.order);
};

/**
 * Получение вкладки по ID
 * 
 * @param {string} tabId - ID вкладки
 * @returns {Object|undefined} Конфигурация вкладки
 */
export const getTabById = (tabId) => {
  return tabsConfig.find(tab => tab.id === tabId);
};