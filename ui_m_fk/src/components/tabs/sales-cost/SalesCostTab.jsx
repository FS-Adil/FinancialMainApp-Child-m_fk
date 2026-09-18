import { useState } from 'react';
import { Card, Space, Tag } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import SalesCostForm from './SalesCostForm';
import SalesCostTable from './SalesCostTable';
import costService from '../../../services/costService';
import LoadingSpinner from '../../shared/LoadingSpinner';
import ErrorMessage from '../../shared/ErrorMessage';
import EmptyState from '../../shared/EmptyState';

/**
 * Вкладка "Себестоимость продаж"
 * 
 * Решает проблемы:
 * 1. Управление состоянием расчета
 * 2. Взаимодействие с сервисом расчета
 * 3. Отображение разных состояний (загрузка, ошибка, данные, пусто)
 * 4. Отображение метаданных расчета (организация, период, итоги)
 * 
 * Состояния:
 * - idle: Начальное состояние (показываем форму)
 * - loading: Идет расчет (показываем спиннер)
 * - error: Ошибка расчета (показываем ошибку с повтором)
 * - success: Данные получены (показываем таблицу с метаданными)
 */
const SalesCostTab = () => {
  const [state, setState] = useState('idle'); // idle | loading | error | success
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [currentParams, setCurrentParams] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [serverStatus, setServerStatus] = useState(true); // true - реальные данные, false - тестовые

  /**
   * Получение UUID организации из env файла
   */
  const getOrganizationId = () => {
    return import.meta.env.VITE_ORGANIZATION_ID || '';
  };

  /**
   * Получение названия организации
   */
  const getOrganizationName = () => {
    // Можно получить из env или из данных
    return import.meta.env.VITE_ORGANIZATION_NAME || 'ООО "Компания"';
  };

  /**
   * Форматирование периода для отображения
   */
  const getFormattedPeriod = () => {
    if (!currentParams) return '';
    
    const { startDate, endDate } = currentParams;
    
    // Форматируем даты в русский формат
    const formatDate = (dateStr) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}.${month}.${year}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  /**
   * Расчет себестоимости
   */
  const handleCalculate = async (startDate, endDate) => {
    setState('loading');
    setError(null);
    setCurrentParams({ startDate, endDate });
    setMetaData(null);

    try {
      const organizationId = getOrganizationId();
      
      const result = await costService.calculateSalesCost(
        startDate, 
        endDate, 
        organizationId
      );
      
      // Обработка результата
      if (result && result.metaData) {
        // Если сервис вернул метаданные
        setData(result.items || result.data || []);
        setMetaData(result.metaData);
        setServerStatus(result.isRealData !== undefined ? result.isRealData : true);
      } else {
        // Если сервис вернул просто массив данных
        const dataArray = Array.isArray(result) ? result : (result?.items || []);
        setData(dataArray);
        
        // Создаем метаданные на основе данных
        if (dataArray.length > 0) {
          const calculatedMetaData = calculateMetaData(dataArray);
          setMetaData(calculatedMetaData);
          setServerStatus(result?.isRealData !== undefined ? result.isRealData : false);
        }
      }
      
      setState('success');
    } catch (err) {
      setError(err.message || 'Ошибка при расчете себестоимости продаж');
      setState('error');
    }
  };

  /**
   * Вычисление метаданных на основе данных
   */
  const calculateMetaData = (items) => {
    const totalRecords = items.length;
    
    // Вычисление итогов
    const totals = items.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalPrice += item.price || 0;
      acc.totalCost += item.cost || 0;
      return acc;
    }, { 
      totalQuantity: 0, 
      totalPrice: 0, 
      totalCost: 0 
    });
    
    // Вычисление прибыли
    const totalProfit = totals.totalPrice - totals.totalCost;
    
    // Вычисление средней рентабельности
    const averageProfitability = totals.totalPrice > 0 
      ? (totalProfit / totals.totalPrice * 100) 
      : 0;
    
    return {
      totalRecords,
      totalQuantity: totals.totalQuantity,
      totalPrice: totals.totalPrice,
      totalCost: totals.totalCost,
      totalProfit,
      averageProfitability
    };
  };

  /**
   * Повтор расчета при ошибке
   */
  const handleRetry = () => {
    if (currentParams) {
      handleCalculate(currentParams.startDate, currentParams.endDate);
    }
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>Расчет себестоимости продаж</h2>
        <p className="panel-description">
          Выберите период для расчета себестоимости проданных товаров
        </p>
      </div>

      {/* Форма всегда видна */}
      <SalesCostForm 
        onCalculate={handleCalculate} 
        loading={state === 'loading'} 
      />

      {/* Контент в зависимости от состояния */}
      <div className="panel-content">
        {state === 'loading' && (
          <LoadingSpinner message="Выполняется расчет себестоимости..." />
        )}

        {state === 'error' && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {state === 'success' && data && data.length > 0 && (
          <Card 
            title={
              <Space>
                <span>Результаты расчета</span>
                {!serverStatus && (
                  <Tag color="warning">Тестовые данные</Tag>
                )}
              </Space>
            }
            extra={
              <Space split="|" size={4}>
                <span>
                  <strong>Организация:</strong> {getOrganizationName()}
                </span>
                <span>
                  <strong>Период:</strong> {getFormattedPeriod()}
                </span>
                {metaData && metaData.totalRecords > 0 && (
                  <span>
                    <strong>Всего записей:</strong> {metaData.totalRecords}
                  </span>
                )}
              </Space>
            }
            style={{ marginTop: 16 }}
          >
            <SalesCostTable 
              data={data} 
              // onExport={handleExport}
              loading={false}
            />
            
            {metaData && (
              <div style={{ 
                marginTop: 16, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 0',
                borderTop: '1px solid #f0f0f0'
              }}>
                <Space size="large">
                  {metaData.totalProfit !== undefined && (
                    <span>
                      <strong>Общая прибыль:</strong>{' '}
                      {new Intl.NumberFormat('ru-RU', { 
                        style: 'currency', 
                        currency: 'RUB' 
                      }).format(metaData.totalProfit)}
                    </span>
                  )}
                  {/* {metaData.averageProfitability !== undefined && (
                    <span>
                      <strong>Средняя рентабельность:</strong>{' '}
                      {metaData.averageProfitability.toFixed(2)}%
                    </span>
                  )} */}
                  {/* {metaData.totalQuantity !== undefined && (
                    <span>
                      <strong>Общее количество:</strong>{' '}
                      {metaData.totalQuantity.toLocaleString('ru-RU')}
                    </span>
                  )} */}
                </Space>
                <span>
                  {!serverStatus && (
                    <span style={{ color: '#faad14' }}>
                      <WarningOutlined style={{ marginRight: 8 }} />
                      Демонстрационные данные
                    </span>
                  )}
                </span>
              </div>
            )}
            
            {!metaData && (
              <div style={{ 
                marginTop: 16, 
                display: 'flex', 
                justifyContent: 'flex-end', 
                padding: '8px 0',
                borderTop: '1px solid #f0f0f0'
              }}>
                <span>
                  Всего записей: <strong>{data.length}</strong>
                </span>
              </div>
            )}
          </Card>
        )}

        {state === 'idle' && (
          <EmptyState message="Выберите период и нажмите 'Рассчитать'" />
        )}
      </div>
    </div>
  );
};

export default SalesCostTab;