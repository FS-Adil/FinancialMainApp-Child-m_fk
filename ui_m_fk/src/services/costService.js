import bffApi from '../api/bffApi';
import dayjs from 'dayjs';

/**
 * Сервис для расчета себестоимости
 * 
 * Решает проблемы:
 * 1. Запрос себестоимости продаж за период
 * 2. Запрос себестоимости остатков на дату
 * 3. Преобразование данных с сервера в нужный формат
 * 4. Генерация тестовых данных при недоступности API
 * 
 * ВАЖНО: organizationId передается извне
 */
class CostService {
  /**
   * Преобразование данных сервера для себестоимости продаж
   * @param {Array} serverData - данные с сервера
   * @param {string} startDate - дата начала
   * @param {string} endDate - дата окончания
   * @returns {Object} - преобразованные данные { items, total }
   */
  transformSalesData(serverData, startDate, endDate) {
    if (!serverData || !Array.isArray(serverData) || serverData.length === 0) {
      console.warn('Нет данных с сервера для преобразования');
      return { items: [], total: null };
    }

    console.log('🔄 Преобразование данных продаж:', serverData.length, 'записей');

    // Преобразуем каждый элемент
    const items = serverData.map((item, index) => {
      // Извлекаем поля с учетом возможных вариантов названий
      const name = item['name'] || item['Наименование'] || item['наименование'] || '';
      const characteristic = item['characteristic'] || item['Характеристика'] || '';
      const batch = item['batch'] || item['Партия'] || '';
      const measurementUnit = item['measurementUnit'] || item['ЕдиницаИзмерения'] || '';
      const quantity = Number(item['quantity'] || item['Количество'] || 0);
      const price = Number(item['price'] || item['Стоимость'] || 0);
      const cost = Number(item['cost'] || item['Себестоимость'] || 0);
      const autoFilling = item['autoFilling'] || 'Да';

      // Генерируем ID и код
      const id = item['id'] || item['refKey'] || `${index + 1}-${Date.now()}`;
      const productId = item['productId'] || item['number'] || `PRD-${(index + 1).toString().padStart(6, '0')}`;

      // Вычисляем прибыль и рентабельность
      const profit = parseFloat((price - cost).toFixed(2));
      const profitability = cost > 0 
        ? parseFloat(((profit / cost) * 100).toFixed(2))
        : 0;

      return {
        id,
        productId,
        nomenclatureCode: productId,
        nomenclatureName: name,
        name,
        characteristic,
        batch,
        measurementUnit,
        quantity,
        price,
        unitCost: cost,
        totalCost: parseFloat((cost * quantity).toFixed(2)),
        cost,
        autoFilling,
        organization: import.meta.env.VITE_ORGANIZATION_NAME,
        profit,
        profitability,
        date: item['date'] || this.generateRandomDate(startDate, endDate),
      };
    }).filter(item => item.nomenclatureName); // Удаляем элементы без названия

    // Вычисляем итоги
    const total = items.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalCost += item.totalCost || 0;
      return acc;
    }, { totalQuantity: 0, totalCost: 0 });

    return {
      items,
      total: {
        totalQuantity: parseFloat(total.totalQuantity.toFixed(2)),
        totalCost: parseFloat(total.totalCost.toFixed(2))
      },
      isRealData: true  // Добавляем флаг
    };
  }

  /**
   * Преобразование данных сервера для себестоимости остатков
   * @param {Array} serverData - данные с сервера
   * @param {string} date - дата остатков
   * @returns {Object} - преобразованные данные { items, total }
   */
  transformStockData(serverData, date) {
    if (!serverData || !Array.isArray(serverData) || serverData.length === 0) {
      console.warn('Нет данных остатков с сервера');
      return { items: [], total: null };
    }

    console.log('🔄 Преобразование данных остатков:', serverData.length, 'записей');

    // Преобразуем каждый элемент
    const items = serverData.map((item, index) => {
      // Извлекаем поля с учетом возможных вариантов названий
      const name = item['name'] || item['Наименование'] || item['наименование'] || '';
      const characteristic = item['characteristic'] || item['Характеристика'] || '';
      const batch = item['batch'] || item['Партия'] || '';
      const measurementUnit = item['measurementUnit'] || item['ЕдиницаИзмерения'] || '';
      const quantity = Number(item['quantity'] || item['Остаток'] || 0);
      const cost = Number(item['cost'] || item['Себестоимость'] || item['price'] || 0);

      // Генерируем ID и код
      const id = item['id'] || item['refKey'] || `${index + 1}-${Date.now()}`;
      const productId = item['productId'] || item['number'] || `PRD-${(index + 1).toString().padStart(6, '0')}`;

      return {
        id,
        productId,
        nomenclatureCode: productId,
        nomenclatureName: name,
        name,
        characteristic,
        batch,
        measurementUnit,
        quantity,
        unitCost: cost,
        totalCost: parseFloat((cost * quantity).toFixed(2)),
        organization: import.meta.env.VITE_ORGANIZATION_NAME,
        cost,
        date: date,
      };
    }).filter(item => item.nomenclatureName); // Удаляем элементы без названия

    // Вычисляем итоги
    const total = items.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalCost += item.totalCost || 0;
      return acc;
    }, { totalQuantity: 0, totalCost: 0 });

    return {
      items,
      total: {
        totalQuantity: parseFloat(total.totalQuantity.toFixed(2)),
        totalCost: parseFloat(total.totalCost.toFixed(2))
      },
      isRealData: true  // Добавляем флаг
    };
  }

  /**
   * Генерация случайной даты в диапазоне
   */
  generateRandomDate(startDate, endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const daysDiff = end.diff(start, 'day');
    
    return start
      .add(Math.floor(Math.random() * (daysDiff + 1)), 'day')
      .format('YYYY-MM-DD');
  }

  /**
   * Генерация тестовых данных для себестоимости продаж
   */
  generateMockSalesData(startDate, endDate, organizationId) {
    const recordCount = Math.max(20, Math.min(100, Math.floor(Math.random() * 50) + 50));
    
    const PRODUCT_CATEGORIES = [
      'Электроника', 'Одежда', 'Продукты', 'Мебель', 'Канцелярия',
      'Автозапчасти', 'Косметика', 'Книги', 'Игрушки', 'Спорттовары'
    ];

    const items = Array.from({ length: recordCount }, (_, i) => {
      const quantity = Math.floor(Math.random() * 1000) + 1;
      const price = parseFloat((Math.random() * 10000 + 100).toFixed(2));
      const cost = parseFloat((Math.random() * 8000 + 50).toFixed(2));
      const profit = parseFloat((price - cost).toFixed(2));
      const profitability = cost > 0 ? parseFloat(((profit / cost) * 100).toFixed(2)) : 0;

      return {
        id: `${organizationId}-${i + 1}-${Date.now()}`,
        productId: `PRD-${(i + 1).toString().padStart(6, '0')}`,
        nomenclatureCode: `PRD-${(i + 1).toString().padStart(6, '0')}`,
        nomenclatureName: `Товар ${i + 1}`,
        name: `Товар ${i + 1}`,
        characteristic: `Характеристика ${Math.floor(Math.random() * 10) + 1}`,
        batch: `Партия ${Math.floor(Math.random() * 20) + 1}`,
        measurementUnit: 'шт',
        category: PRODUCT_CATEGORIES[Math.floor(Math.random() * PRODUCT_CATEGORIES.length)],
        quantity,
        price,
        unitCost: cost,
        totalCost: parseFloat((cost * quantity).toFixed(2)),
        cost,
        autoFilling: 'Да',
        profit,
        profitability,
        date: this.generateRandomDate(startDate, endDate),
        organization: import.meta.env.VITE_ORGANIZATION_NAME,
        organizationId,
      };
    });

    const total = items.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalCost += item.totalCost || 0;
      return acc;
    }, { totalQuantity: 0, totalCost: 0 });

    return {
      items,
      total: {
        totalQuantity: parseFloat(total.totalQuantity.toFixed(2)),
        totalCost: parseFloat(total.totalCost.toFixed(2))
      }
    };
  }

  /**
   * Генерация тестовых данных для остатков
   */
  generateMockStockData(date, organizationId) {
    const recordCount = Math.floor(Math.random() * 100) + 50;
    
    const PRODUCT_CATEGORIES = [
      'Электроника', 'Одежда', 'Продукты', 'Мебель', 'Канцелярия',
      'Автозапчасти', 'Косметика', 'Книги', 'Игрушки', 'Спорттовары'
    ];

    const items = Array.from({ length: recordCount }, (_, i) => {
      const quantity = Math.floor(Math.random() * 500) + 1;
      const cost = parseFloat((Math.random() * 5000 + 100).toFixed(2));

      return {
        id: `${organizationId}-balance-${i + 1}-${Date.now()}`,
        productId: `PRD-${(i + 1).toString().padStart(6, '0')}`,
        nomenclatureCode: `PRD-${(i + 1).toString().padStart(6, '0')}`,
        nomenclatureName: `Товар ${i + 1}`,
        name: `Товар ${i + 1}`,
        characteristic: `Характеристика ${Math.floor(Math.random() * 10) + 1}`,
        batch: `Партия ${Math.floor(Math.random() * 20) + 1}`,
        measurementUnit: 'шт',
        category: PRODUCT_CATEGORIES[Math.floor(Math.random() * PRODUCT_CATEGORIES.length)],
        quantity,
        unitCost: cost,
        totalCost: parseFloat((cost * quantity).toFixed(2)),
        cost,
        autoFilling: 'Да',
        date,
        organization: import.meta.env.VITE_ORGANIZATION_NAME,
        organizationId,
      };
    });

    const total = items.reduce((acc, item) => {
      acc.totalQuantity += item.quantity || 0;
      acc.totalCost += item.totalCost || 0;
      return acc;
    }, { totalQuantity: 0, totalCost: 0 });

    return {
      items,
      total: {
        totalQuantity: parseFloat(total.totalQuantity.toFixed(2)),
        totalCost: parseFloat(total.totalCost.toFixed(2))
      }
    };
  }

  /**
   * Расчет себестоимости продаж за период
   * 
   * @param {string} startDate - Дата начала периода (YYYY-MM-DD)
   * @param {string} endDate - Дата окончания периода (YYYY-MM-DD)
   * @param {string} organizationId - UUID организации (обязательный параметр)
   * @returns {Promise<{items: Array, total: Object}>}
   */
  async calculateSalesCost(startDate, endDate, organizationId) {
    try {
      // Валидация дат
      if (!startDate || !endDate) {
        throw new Error('Не указан период отчета');
      }
      
      if (dayjs(endDate).isBefore(dayjs(startDate))) {
        throw new Error('Дата окончания периода не может быть раньше даты начала');
      }

      // Проверяем наличие organizationId
      if (!organizationId) {
        console.warn('⚠️ OrganizationId не указан');
      }

      console.log('📤 Запрос расчета себестоимости продаж:', {
        startDate,
        endDate,
        organizationId
      });

      const response = await bffApi.post('/api/cost/sales', {
        startDate: dayjs(startDate).format('YYYY-MM-DD') + 'T00:00:00',
        endDate: dayjs(endDate).format('YYYY-MM-DD') + 'T23:59:59',
        organizationId
      });

      console.log('📦 Ответ от BFF:', response.data);

      // Обработка различных форматов ответа
      let serverData;
      if (response.data && Array.isArray(response.data)) {
        serverData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        serverData = response.data.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        // Если BFF уже вернул в нужном формате
        return {
          ...response.data,
          isRealData: true  // Добавляем флаг
        };
        // return response.data;
      } else {
        throw new Error('Неожиданный формат ответа от сервера');
      }

      // Преобразуем данные
      return this.transformSalesData(serverData, startDate, endDate);

    } catch (error) {
      console.warn('⚠️ BFF API недоступен, генерируем тестовые данные продаж', error);
      
      // Генерируем тестовые данные при ошибке
      return this.generateMockSalesData(startDate, endDate, organizationId);
    }
  }

  /**
   * Расчет себестоимости остатков на дату
   * 
   * @param {string} date - Дата расчета (YYYY-MM-DD)
   * @param {string} organizationId - UUID организации (обязательный параметр)
   * @returns {Promise<{items: Array, total: Object}>}
   */
  async calculateStockCost(date, organizationId) {
    try {
      // Валидация даты
      if (!date) {
        throw new Error('Не указана дата остатков');
      }

      // Проверяем наличие organizationId
      if (!organizationId) {
        console.warn('⚠️ OrganizationId не указан');
      }

      console.log('📤 Запрос расчета себестоимости остатков:', {
        date,
        organizationId
      });

      const response = await bffApi.post('/api/cost/stocks', {
        date: dayjs(date).format('YYYY-MM-DD') + 'T23:59:59',
        organizationId
      });

      console.log('📦 Ответ от BFF:', response.data);

      // Обработка различных форматов ответа
      let serverData;
      if (response.data && Array.isArray(response.data)) {
        serverData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        serverData = response.data.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        // Если BFF уже вернул в нужном формате
        return {
          ...response.data,
          isRealData: true  // Добавляем флаг
        };
      } else {
        throw new Error('Неожиданный формат ответа от сервера');
      }

      // Преобразуем данные
      return this.transformStockData(serverData, date);

    } catch (error) {
      console.warn('⚠️ BFF API недоступен, генерируем тестовые данные остатков', error);
      
      // Генерируем тестовые данные при ошибке
      return this.generateMockStockData(date, organizationId);
    }
  }
}

export default new CostService();