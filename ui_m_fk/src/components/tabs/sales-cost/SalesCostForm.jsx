import { useState } from 'react';
import { DatePicker } from 'antd';
import 'antd/dist/antd.css';

const { RangePicker } = DatePicker;

/**
 * Форма выбора периода для расчета себестоимости продаж
 * 
 * Решает проблемы:
 * 1. Выбор даты начала и конца периода в одном компоненте
 * 2. Валидация: начало не может быть позже конца
 * 3. Валидация: даты не могут быть в будущем
 * 4. Блокировка кнопки при некорректных данных
 * 5. Очистка ошибок при изменении дат
 * 
 * @param {Object} props
 * @param {Function} props.onCalculate - Обработчик расчета (принимает startDate, endDate)
 * @param {boolean} props.loading - Идет ли загрузка
 */
const SalesCostForm = ({ onCalculate, loading }) => {
  const [dateRange, setDateRange] = useState(null);
  const [errors, setErrors] = useState({});

  /**
   * Валидация выбранного диапазона дат
   */
  const validate = () => {
    const newErrors = {};

    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      newErrors.range = 'Выберите период для расчета (начало и конец)';
    } else {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Учитываем весь текущий день
      
      const todayStr = today.toISOString().split('T')[0];

      if (startDate > endDate) {
        newErrors.range = 'Дата окончания не может быть раньше даты начала';
      }

      if (startDate > todayStr) {
        newErrors.range = 'Дата начала не может быть в будущем';
      }

      if (endDate > todayStr) {
        newErrors.range = 'Дата окончания не может быть в будущем';
      }

      // Проверка на слишком большой период (опционально)
      const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        newErrors.range = 'Период не может превышать 365 дней';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Обработчик изменения диапазона дат
   */
  const handleRangeChange = (dates) => {
    setDateRange(dates);
    // Очищаем ошибки при изменении дат
    if (dates && dates[0] && dates[1]) {
      setErrors({});
    } else if (dates) {
      // Если выбрана только одна дата
      setErrors({ range: 'Выберите обе даты периода' });
    }
  };

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const startDate = dateRange[0].format('YYYY-MM-DD');
    const endDate = dateRange[1].format('YYYY-MM-DD');
    onCalculate(startDate, endDate);
  };

  // Проверка валидности для кнопки
  const isValid = dateRange && 
                  dateRange[0] && 
                  dateRange[1] && 
                  Object.keys(errors).length === 0;

  // Функция для блокировки будущих дат
  const disabledDate = (current) => {
    // Блокируем даты после сегодняшнего дня
    return current && current > new Date();
  };

  return (
    <form className="cost-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date-range">Период расчета</label>
          <RangePicker
            id="date-range"
            value={dateRange}
            onChange={handleRangeChange}
            disabled={loading}
            disabledDate={disabledDate}
            format="YYYY-MM-DD"
            placeholder={['Дата начала', 'Дата окончания']}
            className={errors.range ? 'input-error' : ''}
            style={{ width: '100%' }}
            allowClear
          />
          {errors.range && (
            <span className="field-error" style={{ 
              color: '#ff4d4f', 
              fontSize: '12px', 
              marginTop: '4px',
              display: 'block'
            }}>
              {errors.range}
            </span>
          )}
        </div>
      </div>

      {/* Кнопка расчета */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="calculate-btn"
        // style={{
        //   backgroundColor: (!isValid || loading) ? '#d9d9d9' : '#1890ff',
        //   color: '#fff',
        //   border: 'none',
        //   padding: '8px 16px',
        //   borderRadius: '4px',
        //   cursor: (!isValid || loading) ? 'not-allowed' : 'pointer',
        //   marginTop: '8px'
        // }}
      >
        {loading ? 'Расчет...' : 'Рассчитать'}
      </button>
    </form>
  );
};

export default SalesCostForm;