import React, { useMemo } from 'react';
import { Table, Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { exportToExcel } from '../../../utils/exportToExcel';
import { XSSProtection } from '../../../utils/xssProtection';

/**
 * Таблица результатов расчета себестоимости продаж
 * 
 * @param {Object} props
 * @param {Object|Array} props.data - Данные расчета
 * @param {Function} props.onExport - Функция экспорта
 * @param {boolean} props.loading - Индикатор загрузки
 * @param {Object} props.metaData - Метаданные расчета (опционально)
 */
const SalesCostTable = ({ data, onExport, loading = false, metaData }) => {
  // Определение колонок таблицы
  const columns = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      fixed: 'left',
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Характеристика',
      dataIndex: 'characteristic',
      key: 'characteristic',
      width: 100,
      fixed: 'left',
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Партия',
      dataIndex: 'batch',
      key: 'batch',
      width: 100,
      fixed: 'left',
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Единица Измерения',
      dataIndex: 'measurementUnit',
      key: 'measurementUnit',
      width: 100,
      fixed: 'left',
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'right',
      render: (value) => (value || 0).toLocaleString('ru-RU'),
    },
    {
      title: 'Стоимость',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      align: 'right',
      render: (value) => `${(value || 0).toLocaleString('ru-RU', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })} ₽`,
    },
    {
      title: 'Себестоимость',
      dataIndex: 'cost',
      key: 'cost',
      width: 150,
      align: 'right',
      render: (value) => `${(value || 0).toLocaleString('ru-RU', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })} ₽`,
    },
    {
      title: 'Рентабельность',
      dataIndex: 'profitability',
      key: 'profitability',
      width: 150,
      align: 'right',
      render: (value) => `${(value || 0).toLocaleString('ru-RU', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}%`,
    },
  ];

  // Вычисление итогов
  const totals = useMemo(() => {
    const items = getDataArray();
    
    if (!items.length) {
      return { 
        quantity: 0, 
        price: 0, 
        cost: 0,
        profitability: 0 
      };
    }
    
    return items.reduce((acc, item) => {
      acc.quantity += item.quantity || 0;
      acc.price += item.price || 0;
      acc.cost += item.cost || 0;
      return acc;
    }, { 
      quantity: 0, 
      price: 0, 
      cost: 0 
    });
  }, [data]);

  // Вычисление средней рентабельности
  const averageProfitability = useMemo(() => {
    if (!totals.price) return 0;
    return ((totals.price - totals.cost) / totals.price * 100) || 0;
  }, [totals.price, totals.cost]);

  // Футер таблицы с итогами
  const footer = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      fontWeight: 'bold',
      padding: '8px 0',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      <span>Итого:</span>
      <span>
        Количество: {totals.quantity.toLocaleString('ru-RU')}
      </span>
      <span>
        Стоимость: {totals.price.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} ₽
      </span>
      <span>
        Себестоимость: {totals.cost.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} ₽
      </span>
      <span>
        Ср. рентабельность: {averageProfitability.toFixed(2)}%
      </span>
    </div>
  );

  // Получение массива данных
  function getDataArray() {
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  }

  const dataArray = getDataArray();


  // Если нет данных, показываем пустое состояние
  if (!dataArray.length && !loading) {
    return (
      <div style={{ 
        padding: '24px',
        textAlign: 'center',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px dashed #d9d9d9'
      }}>
        <p style={{ margin: 0, color: '#666' }}>
          Нет данных для отображения
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0 }}>Детализация расчета</h3>
        <Button 
          type="primary" 
          icon={<FileExcelOutlined />}
          onClick={() => exportToExcel(
            dataArray,
            'Маржа'
          )}
          disabled={!dataArray.length}
        >
          Экспорт в Excel
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={dataArray}
        loading={loading}
        scroll={{ x: 1500, y: 'calc(100vh - 350px)' }}
        pagination={false}
        rowKey={(record) => record.id || record.name || Math.random().toString(36).substr(2, 9)}
        footer={dataArray.length ? footer : undefined}
        size="middle"
        locale={{
          emptyText: 'Нет данных'
        }}
      />
    </div>
  );
};

export default SalesCostTable;