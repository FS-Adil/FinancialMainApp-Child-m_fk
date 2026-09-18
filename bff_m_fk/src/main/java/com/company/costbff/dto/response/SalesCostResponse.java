package com.company.costbff.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Ответ с результатами расчета себестоимости продаж
 *
 * Решает проблемы:
 * 1. Структурирование данных расчета
 * 2. Предоставление сводной информации
 * 3. Детализация по продуктам
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesCostResponse {

    // Период расчета
    private String startDate;
    private String endDate;

    // Сводная информация
    private Summary summary;

    // Детализация по продуктам
    private List<ProductCostDetail> details;

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
        private int totalSales;
        private BigDecimal totalRevenue;
        private BigDecimal totalCost;
        private BigDecimal totalProfit;
        private BigDecimal averageMargin;
    }

    /**
     * Детализация себестоимости продукта
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductCostDetail {
        private String productId;
        private String productName;
        private String sku;
        private int quantitySold;
        private BigDecimal unitCost;
        private BigDecimal totalCost;
        private BigDecimal revenue;
        private BigDecimal profit;
        private BigDecimal marginPercent;
        private String costMethod; // FIFO, LIFO, Average
    }

    /**
     * Общие итоги
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Totals {
        private BigDecimal totalCost;
        private BigDecimal totalRevenue;
        private BigDecimal totalProfit;
        private BigDecimal overallMargin;
    }
}