package com.company.costbff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Ответ с результатами расчета себестоимости остатков
 *
 * Решает проблемы:
 * 1. Структурирование данных расчета
 * 2. Предоставление сводной информации по складам
 * 3. Детализация по продуктам
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCostResponse {

    // Дата расчета
    private String date;

    // Сводная информация
    private Summary summary;

    // Детализация по продуктам
    private List<ProductStockDetail> details;

    // Общие итоги
    private Totals totals;

    /**
     * Сводная информация
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private int totalProducts;
        private int totalWarehouses;
        private BigDecimal totalStockValue;
        private BigDecimal totalStockQuantity;
    }

    /**
     * Детализация остатков продукта
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductStockDetail {
        private String productId;
        private String productName;
        private String sku;
        private String warehouseId;
        private String warehouseName;
        private BigDecimal quantity;
        private BigDecimal unitCost;
        private BigDecimal totalCost;
        private String costMethod;
        private String lastPurchaseDate;
    }

    /**
     * Общие итоги
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Totals {
        private BigDecimal totalStockValue;
        private int totalUniqueProducts;
        private int totalWarehouses;
    }
}