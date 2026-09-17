import { useState } from 'react';
import { DatePicker } from 'antd';

/**
 * Форма выбора даты для расчета себестоимости остатков
 * 
 * Решает проблемы:
 * 1. Выбор даты, на которую производится расчет
 * 2. Валидация: дата не может быть в будущем
 * 3. Очистка ошибок при изменении даты
 * 4. Блокировка кнопки при некорректных данных
 * 
 * @param {Object} props
 * @param {Function} props.onCalculate - Обработчик расчета (принимает date в формате YYYY-MM-DD)
 * @param {boolean} props.loading - Идет ли загрузка
 */
const StockCostForm = ({ onCalculate, loading }) => {
  const [date, setDate] = useState(null);
  const [error, setError] = useState('');

  /**
   * Валидация формы
   */
  const validate = () => {
    if (!date) {
      setError('Выберите дату расчета');
      return false;
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999); // Учитываем весь текущий день
    
    if (date.toDate() > today) {
      setError('Дата не может быть в будущем');
      return false;
    }

    setError('');
    return true;
  };

  /**
   * Обработчик изменения даты
   */
  const handleDateChange = (value) => {
    setDate(value);
    // Очищаем ошибку при изменении даты
    if (value) {
      setError('');
    }
  };

  /**
   * Обработчик отправки формы
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    onCalculate(date.format('YYYY-MM-DD'));
  };

  /**
   * Блокировка будущих дат
   */
  const disabledDate = (current) => {
    return current && current > new Date();
  };

  return (
    <form className="cost-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label 
          htmlFor="calc-date" 
          style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#333'
          }}
        >
          Дата расчета
        </label>
        <DatePicker
          id="calc-date"
          value={date}
          onChange={handleDateChange}
          disabled={loading}
          disabledDate={disabledDate}
          format="YYYY-MM-DD"
          placeholder="Выберите дату расчета"
          className={error ? 'input-error' : ''}
          style={{ 
            width: '100%',
            ...(error && { borderColor: '#ff4d4f' })
          }}
          allowClear
        />
        {error && (
          <span 
            id="date-error" 
            className="field-error"
            style={{ 
              color: '#ff4d4f', 
              fontSize: '12px', 
              marginTop: '4px', 
              display: 'block' 
            }}
          >
            {error}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={!date || loading}
        className="calculate-btn"
        // style={{
        //   backgroundColor: (!date || loading) ? '#d9d9d9' : '#1890ff',
        //   color: '#fff',
        //   border: 'none',
        //   padding: '8px 16px',
        //   borderRadius: '4px',
        //   cursor: (!date || loading) ? 'not-allowed' : 'pointer',
        //   marginTop: '8px'
        // }}
      >
        {loading ? 'Расчет...' : 'Рассчитать'}
      </button>
    </form>
  );
};

export default StockCostForm;