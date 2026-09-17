import React, { useMemo } from 'react';
import { Table, Button } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import { exportToExcel } from '../../../utils/exportToExcel';
import { XSSProtection } from '../../../utils/xssProtection';

/**
 * Таблица результатов расчета себестоимости остатков
 * 
 * @param {Object} props
 * @param {Object} props.data - Данные расчета
 * @param {Function} props.onExport - Функция экспорта
 * @param {boolean} props.loading - Индикатор загрузки
 * @param {Object} props.metaData - Метаданные расчета (опционально)
 */
const StockCostTable = ({ data, onExport, loading = false, metaData }) => {
  // Определение колонок таблицы
  const columns = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      fixed: 'left',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Характеристика',
      dataIndex: 'characteristic',
      key: 'characteristic',
      width: 150,
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Партия',
      dataIndex: 'batch',
      key: 'batch',
      width: 150,
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Единица Измерения',
      dataIndex: 'measurementUnit',
      key: 'measurementUnit',
      width: 150,
      render: (value) => XSSProtection.escapeHTML(value || ''),
    },
    {
      title: 'Количество',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'right',
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
      render: (value) => (value || 0).toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    },
    // {
    //   title: 'Себестоимость ед.',
    //   dataIndex: 'unitCost',
    //   key: 'unitCost',
    //   width: 180,
    //   align: 'right',
    //   sorter: (a, b) => (a.unitCost || 0) - (b.unitCost || 0),
    //   render: (value) => {
    //     if (value === undefined || value === null) return '0,00 ₽';
    //     return `${value.toLocaleString('ru-RU', {
    //       minimumFractionDigits: 2,
    //       maximumFractionDigits: 2
    //     })} ₽`;
    //   },
    // },
    {
      title: 'Себестоимость',
      dataIndex: 'cost',
      key: 'cost',
      width: 200,
      align: 'right',
      sorter: (a, b) => (a.cost || 0) - (b.cost || 0),
      render: (value) => {
        if (value === undefined || value === null) return '0,00 ₽';
        return `${value.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} ₽`;
      },
    },
  ];

  // Получение массива данных
  const getDataArray = () => {
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const dataArray = getDataArray();

  // Вычисление итогов
  const totals = useMemo(() => {
    if (!dataArray.length) {
      return { totalQuantity: 0, totalCost: 0 };
    }
    
    // Если итоги уже предоставлены в data.total
    if (data?.total) {
      return data.total;
    }
    
    // Если метаданные предоставлены
    if (metaData?.totalQuantity !== undefined || metaData?.totalCost !== undefined) {
      return {
        totalQuantity: metaData.totalQuantity || 0,
        totalCost: metaData.totalCost || 0
      };
    }
    
    // Вычисляем итоги из items
    return dataArray.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalCost += item.totalCost || 0;
      return acc;
    }, { totalQuantity: 0, totalCost: 0 });
  }, [data, dataArray, metaData]);

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
      <span>ИТОГО по остаткам:</span>
      <span>
        Остаток: {totals.totalQuantity.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </span>
      <span>
        Стоимость остатка: {totals.totalCost.toLocaleString('ru-RU', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} ₽
      </span>
      {dataArray.length > 0 && (
        <span style={{ fontSize: '0.9em', color: '#666' }}>
          ({dataArray.length} поз.)
        </span>
      )}
    </div>
  );

  // Если нет данных и нет загрузки, показываем пустое состояние
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
          Нет данных по остаткам для отображения
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
        <h3 style={{ margin: 0 }}>Детализация остатков</h3>
        <Button 
          type="primary" 
          icon={<FileExcelOutlined />}
          onClick={() => exportToExcel(
            dataArray, 
            'Остатки'
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
        scroll={{ x: 1100, y: 'calc(100vh - 400px)' }}
        pagination={false}
        rowKey={(record) => record.nomenclatureCode || record.id || Math.random().toString(36).substr(2, 9)}
        footer={dataArray.length ? footer : undefined}
        size="middle"
        bordered
        locale={{
          emptyText: 'Нет данных по остаткам'
        }}
      />
    </div>
  );
};

export default StockCostTable;