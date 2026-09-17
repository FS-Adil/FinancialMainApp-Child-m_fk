package com.company.costbff.service;

import com.company.costbff.client.CostServiceClient;
import com.company.costbff.dto.response.SalesCostResponse;
import com.company.costbff.model.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Сервис расчета себестоимости продаж
 *
 * Решает проблемы:
 * 1. Бизнес-логика расчета
 * 2. Взаимодействие с Cost Service
 * 3. Передача контекста пользователя
 *
 * ВАЖНО: Сервис получает контекст от контроллера,
 * который извлек его из сессии BFF.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SalesCostService {

    private final CostServiceClient costServiceClient;

    /**
     * Расчет себестоимости продаж за период
     *
     * @param userContext - Контекст пользователя (из сессии BFF)
     * @param organizationId - UUID организации из UI
     * @param startDate - Дата начала периода
     * @param endDate - Дата окончания периода
     * @return Результат расчета
     */
    public SalesCostResponse calculate(UserContext userContext, String organizationId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Calculating sales cost for user: {}, org: {}, period: {} - {}",
                userContext.userId(), organizationId, startDate, endDate);

        // Вызываем Cost Service
        // BFF передает контекст пользователя (Cost Service доверяет BFF)
        return costServiceClient.getSalesCost(
                userContext.userId(),
                organizationId,
                userContext.role(),
                startDate,
                endDate
        );
    }
}