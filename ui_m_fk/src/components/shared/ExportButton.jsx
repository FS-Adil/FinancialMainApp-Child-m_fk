import { useState } from 'react';

/**
 * Кнопка экспорта в Excel
 * 
 * Решает проблему: Пользователь может скачать результаты расчета
 * в формате Excel для дальнейшей работы.
 * 
 * @param {Object} props
 * @param {Function} props.onClick - Обработчик клика
 * @param {string} props.label - Текст кнопки
 * @param {boolean} props.disabled - Отключена ли кнопка
 */
const ExportButton = ({ 
  onClick, 
  label = 'Экспорт в Excel', 
  disabled = false 
}) => {
  const [exporting, setExporting] = useState(false);

  const handleClick = async () => {
    if (exporting || disabled) return;
    
    setExporting(true);
    try {
      await onClick();
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      className="export-btn"
      onClick={handleClick}
      disabled={disabled || exporting}
      type="button"
      title="Скачать результаты в Excel"
    >
      {exporting ? '⏳ Экспорт...' : `📥 ${label}`}
    </button>
  );
};

export default ExportButton;