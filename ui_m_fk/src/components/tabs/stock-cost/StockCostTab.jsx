import { useState } from 'react';
import { Card, Space, Tag } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import StockCostForm from './StockCostForm';
import StockCostTable from './StockCostTable';
import costService from '../../../services/costService';
import LoadingSpinner from '../../shared/LoadingSpinner';
import ErrorMessage from '../../shared/ErrorMessage';
import EmptyState from '../../shared/EmptyState';

/**
 * Вкладка "Себестоимость остатков"
 * 
 * Решает проблемы:
 * 1. Управление состоянием расчета
 * 2. Взаимодействие с сервисом
 * 3. Отображение разных состояний
 * 4. Отображение метаданных расчета (организация, дата, итоги)
 * 
 * Состояния:
 * - idle: Начальное состояние (показываем форму)
 * - loading: Идет расчет (показываем спиннер)
 * - error: Ошибка расчета (показываем ошибку с повтором)
 * - success: Данные получены (показываем таблицу с метаданными)
 */
const StockCostTab = () => {
  const [state, setState] = useState('idle'); // idle | loading | error | success
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
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
    return import.meta.env.VITE_ORGANIZATION_NAME || 'ООО "Компания"';
  };

  /**
   * Форматирование даты для отображения
   */
  const getFormattedDate = () => {
    if (!currentDate) return '';
    
    const [year, month, day] = currentDate.split('-');
    return `${day}.${month}.${year}`;
  };

  /**
   * Расчет себестоимости остатков
   */
  const handleCalculate = async (date) => {
    setState('loading');
    setError(null);
    setCurrentDate(date);
    setMetaData(null);

    try {
      const organizationId = getOrganizationId();
      
      const result = await costService.calculateStockCost(date, organizationId);
      
      // Обработка результата
      if (result && result.metaData) {
        // Если сервис вернул метаданные
        setData(result);
        setMetaData(result.metaData);
        setServerStatus(result.isRealData !== undefined ? result.isRealData : true);
      } else if (result && result.items) {
        // Если сервис вернул объект с items
        setData(result);
        
        // Создаем метаданные на основе данных
        if (result.items.length > 0) {
          const calculatedMetaData = calculateMetaData(result);
          setMetaData(calculatedMetaData);
          setServerStatus(result.isRealData !== undefined ? result.isRealData : false);
        }
      } else if (Array.isArray(result)) {
        // Если сервис вернул массив
        const dataObject = { items: result };
        setData(dataObject);
        
        if (result.length > 0) {
          const calculatedMetaData = calculateMetaData(dataObject);
          setMetaData(calculatedMetaData);
          setServerStatus(false);
        }
      }
      
      setState('success');
    } catch (err) {
      setError(err.message || 'Ошибка при расчете себестоимости остатков');
      setState('error');
    }
  };

  /**
   * Вычисление метаданных на основе данных
   */
  const calculateMetaData = (data) => {
    const items = data.items || [];
    const totalRecords = items.length;
    
    // Вычисление итогов
    const totals = items.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalCost += item.totalCost || 0;
      return acc;
    }, { 
      totalQuantity: 0, 
      totalCost: 0 
    });
    
    // Используем предоставленные итоги, если они есть
    const finalTotals = data.total || totals;
    
    // Вычисление средней себестоимости единицы
    const averageUnitCost = finalTotals.totalQuantity > 0 
      ? finalTotals.totalCost / finalTotals.totalQuantity 
      : 0;
    
    return {
      totalRecords,
      totalQuantity: finalTotals.totalQuantity,
      totalCost: finalTotals.totalCost,
      averageUnitCost
    };
  };

  /**
   * Экспорт в Excel
   */
  const handleExport = () => {
    if (data && currentDate) {
      const fileName = `sebestoimost_ostatkov_${currentDate}`;
      costService.exportToExcel(data, fileName);
    }
  };

  /**
   * Повтор расчета при ошибке
   */
  const handleRetry = () => {
    if (currentDate) {
      handleCalculate(currentDate);
    }
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>Расчет себестоимости остатков</h2>
        <p className="panel-description">
          Выберите дату для расчета себестоимости остатков товаров
        </p>
      </div>

      {/* Форма всегда видна */}
      <StockCostForm 
        onCalculate={handleCalculate} 
        loading={state === 'loading'} 
      />

      {/* Контент в зависимости от состояния */}
      <div className="panel-content">
        {state === 'loading' && (
          <LoadingSpinner message="Выполняется расчет себестоимости остатков..." />
        )}

        {state === 'error' && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {state === 'success' && data && data.items && data.items.length > 0 && (
          <Card 
            title={
              <Space>
                <span>Результаты расчета остатков</span>
                {!serverStatus && (
                  <Tag color="warning">Тестовые данные</Tag>
                )}
              </Space>
            }
            extra={
              <Space separator="|" size={4}>
                <span>
                  <strong>Организация:</strong> {getOrganizationName()}
                </span>
                <span>
                  <strong>Дата расчета:</strong> {getFormattedDate()}
                </span>
                {metaData && metaData.totalRecords > 0 && (
                  <span>
                    <strong>Всего позиций:</strong> {metaData.totalRecords}
                  </span>
                )}
              </Space>
            }
            style={{ marginTop: 16 }}
          >
            <StockCostTable 
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
                  {/* {metaData.totalQuantity !== undefined && (
                    <span>
                      <strong>Общий остаток:</strong>{' '}
                      {metaData.totalQuantity.toLocaleString('ru-RU', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  )} */}
                  {metaData.totalCost !== undefined && (
                    <span>
                      <strong>Общая стоимость остатков:</strong>{' '}
                      {new Intl.NumberFormat('ru-RU', { 
                        style: 'currency', 
                        currency: 'RUB' 
                      }).format(metaData.totalCost)}
                    </span>
                  )}
                  {/* {metaData.averageUnitCost !== undefined && metaData.averageUnitCost > 0 && (
                    <span>
                      <strong>Средняя себестоимость:</strong>{' '}
                      {new Intl.NumberFormat('ru-RU', { 
                        style: 'currency', 
                        currency: 'RUB' 
                      }).format(metaData.averageUnitCost)}
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
                  Всего позиций: <strong>{data.items.length}</strong>
                </span>
              </div>
            )}
          </Card>
        )}

        {state === 'idle' && (
          <EmptyState message="Выберите дату и нажмите 'Рассчитать'" />
        )}
      </div>
    </div>
  );
};

export default StockCostTab;