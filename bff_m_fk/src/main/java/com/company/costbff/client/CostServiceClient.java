package com.company.costbff.client;

import com.company.costbff.dto.response.SalesCostResponse;
import com.company.costbff.dto.response.StockCostResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Клиент для взаимодействия с Cost Service
 *
 * Решает проблемы:
 * 1. HTTP запросы к Cost Service
 * 2. Передача контекста пользователя через заголовки
 * 3. Обработка ошибок
 *
 * ВАЖНО: Cost Service ПОЛНОСТЬЮ ДОВЕРЯЕТ BFF!
 * BFF передает userId, organizationId, role в заголовках.
 * НИКАКИХ JWT токенов не передается!
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CostServiceClient {

    @Qualifier("costServiceWebClient")
    private final WebClient costServiceWebClient;

    /**
     * Запрос себестоимости продаж
     */
    public SalesCostResponse getSalesCost(
            Long userId,
            String organizationId,
            String role,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        log.info("Requesting sales cost from Cost Service: userId={}, orgId={}", userId, organizationId);

        return costServiceWebClient
                .post()
                .uri("/api/internal/cost/sales")
                // BFF передает контекст пользователя в заголовках
                .header("X-User-ID", userId.toString())
                .header("X-Organization-ID", organizationId)
                .header("X-User-Role", role)
                // НИКАКИХ JWT токенов!
                .bodyValue(Map.of(
                        "startDate", startDate,
                        "endDate", endDate
                ))
                .retrieve()
                .bodyToMono(SalesCostResponse.class)
                .doOnError(error -> log.error("Cost Service error: {}", error.getMessage()))
                .block();
    }

    /**
     * Запрос себестоимости остатков
     */
    public StockCostResponse getStockCost(
            Long userId,
            String organizationId,
            String role,
            String date) {

        log.info("Requesting stock cost from Cost Service: userId={}, orgId={}", userId, organizationId);

        return costServiceWebClient
                .post()
                .uri("/api/internal/cost/stock")
                .header("X-User-ID", userId.toString())
                .header("X-Organization-ID", organizationId)
                .header("X-User-Role", role)
                .bodyValue(Map.of(
                        "date", date
                ))
                .retrieve()
                .bodyToMono(StockCostResponse.class)
                .doOnError(error -> log.error("Cost Service error: {}", error.getMessage()))
                .block();
    }
}