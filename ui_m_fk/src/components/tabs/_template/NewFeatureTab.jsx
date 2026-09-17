import { useState } from 'react';
// Импортируйте нужные сервисы
// import costService from '../../../services/costService';
import LoadingSpinner from '../../shared/LoadingSpinner';
import ErrorMessage from '../../shared/ErrorMessage';
import EmptyState from '../../shared/EmptyState';
import ExportButton from '../../shared/ExportButton';

/**
 * 📋 ШАБЛОН ДЛЯ СОЗДАНИЯ НОВОЙ ВКЛАДКИ
 * 
 * Решает проблемы:
 * 1. Быстрое создание новой функциональности
 * 2. Единообразие всех вкладок
 * 3. Готовая обработка состояний (загрузка, ошибка, данные, пусто)
 * 
 * ИНСТРУКЦИЯ ПО ИСПОЛЬЗОВАНИЮ:
 * 1. Скопируйте этот файл в новую папку (например, margin-analysis/)
 * 2. Переименуйте компонент (например, MarginAnalysisTab)
 * 3. Настройте форму ввода параметров
 * 4. Настройте отображение результатов
 * 5. Добавьте вкладку в config/tabs.config.js
 * 
 * Состояния компонента:
 * - idle: Начальное состояние (показываем форму)
 * - loading: Идет расчет (показываем спиннер)
 * - error: Ошибка (показываем ошибку с кнопкой повтора)
 * - success: Данные получены (показываем результаты)
 */
const NewFeatureTab = () => {
  // Состояние компонента
  const [state, setState] = useState('idle'); // idle | loading | error | success
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  // Параметры расчета (настройте под свои нужды)
  const [params, setParams] = useState({
    // Добавьте свои поля:
    // dateFrom: '',
    // dateTo: '',
    // filter: '',
  });

  /**
   * Обработчик расчета
   * Замените на вызов своего сервиса
   */
  const handleCalculate = async () => {
    setState('loading');
    setError(null);

    try {
      // ЗАМЕНИТЕ на вызов своего сервиса:
      // const result = await yourService.calculate(params);
      // setData(result);
      
      // Временная заглушка:
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData({ message: 'Расчет выполнен успешно' });
      
      setState('success');
    } catch (err) {
      setError(err.message || 'Ошибка при расчете');
      setState('error');
    }
  };

  /**
   * Экспорт в Excel
   */
  const handleExport = () => {
    // ЗАМЕНИТЕ на вызов своего экспорта:
    // costService.exportToExcel(data, 'report-name');
    console.log('Export:', data);
  };

  /**
   * Повтор расчета при ошибке
   */
  const handleRetry = () => {
    handleCalculate();
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>Новая функция</h2>
        <p className="panel-description">
          Описание функциональности (замените на свое)
        </p>
      </div>

      {/* 
        ФОРМА ВВОДА ПАРАМЕТРОВ
        Настройте под свои нужды 
      */}
      <div className="panel-form">
        {/* Пример поля ввода */}
        <div className="form-group">
          <label htmlFor="param1">Параметр 1</label>
          <input
            type="text"
            id="param1"
            value={params.param1 || ''}
            onChange={(e) => setParams({ ...params, param1: e.target.value })}
            disabled={state === 'loading'}
            placeholder="Введите значение"
          />
        </div>

        <button
          type="button"
          onClick={handleCalculate}
          disabled={state === 'loading'}
          className="calculate-btn"
        >
          {state === 'loading' ? 'Расчет...' : 'Рассчитать'}
        </button>
      </div>

      {/* КОНТЕНТ В ЗАВИСИМОСТИ ОТ СОСТОЯНИЯ */}
      <div className="panel-content">
        {state === 'loading' && (
          <LoadingSpinner message="Выполняется расчет..." />
        )}

        {state === 'error' && (
          <ErrorMessage message={error} onRetry={handleRetry} />
        )}

        {state === 'success' && data && (
          <div className="results-section">
            <div className="results-header">
              <h3>Результаты расчета</h3>
              <ExportButton onClick={handleExport} />
            </div>
            
            {/* 
              ТАБЛИЦА ИЛИ ГРАФИК РЕЗУЛЬТАТОВ
              Настройте под свои нужды 
            */}
            <div className="results-content">
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        )}

        {state === 'idle' && (
          <EmptyState message="Настройте параметры и нажмите 'Рассчитать'" />
        )}
      </div>
    </div>
  );
};

export default NewFeatureTab;