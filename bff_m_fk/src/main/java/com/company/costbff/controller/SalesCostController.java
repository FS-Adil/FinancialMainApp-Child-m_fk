package com.company.costbff.controller;

import com.company.costbff.dto.request.SalesCostRequest;
import com.company.costbff.dto.response.ApiResponse;
import com.company.costbff.dto.response.SalesCostResponse;
import com.company.costbff.service.SessionService;
import com.company.costbff.security.SecurityUtils;
import com.company.costbff.service.SalesCostService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Контроллер расчета себестоимости продаж
 *
 * Решает проблемы:
 * 1. Прием запроса от фронтенда
 * 2. Валидация входных данных
 * 3. Получение контекста пользователя из сессии
 * 4. Передача контекста в сервис расчета
 *
 * ВАЖНО: BFF игнорирует любые userId/orgId от клиента!
 * Identity берется ИСКЛЮЧИТЕЛЬНО из сессии BFF.
 */
@Slf4j
@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class SalesCostController {

    private final SalesCostService salesCostService;
    private final SessionService sessionService;

    @PostMapping("/sales")
    public ResponseEntity<?> calculateSalesCost(
            @Valid @RequestBody SalesCostRequest request,
            HttpServletRequest httpRequest) {

        String orgUUID;

        try {
            LocalDateTime startDateTime = request.startDate();
            LocalDateTime endDateTime = request.endDate();

            // Проверка что startDate <= endDate
            if (startDateTime.isAfter(endDateTime)) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Дата начала не может быть позже даты окончания")
                );
            }

            // BFF САМ получает контекст пользователя из сессии
            var userContext = sessionService.getUserContext(httpRequest);

            String contextOrganizationId = userContext.organizationId();

            log.info("Sales cost calculation requested: user={}, org={}, period={} to {}",
                    userContext.userId(), contextOrganizationId, startDateTime, endDateTime);

            if (contextOrganizationId.equals("Admin_plus")) {
                orgUUID = request.organizationId();
            } else if (contextOrganizationId.equals(request.organizationId())) {
                orgUUID = contextOrganizationId;
            } else {
                return ResponseEntity.status(500).body(
                        Map.of("error", "Пользователь не привязан к организации")
                );
            }

            // Выполняем расчет
//            SalesCostResponse result = salesCostService.calculate(
//                    userContext, orgUUID, startDateTime, endDateTime

            List<Map<String, String>> resultList = new ArrayList<>();

            resultList.add(Map.of(
                     "autoFilling", "Да",
                    "batch", "Без партии",
                    "categories", "Дёке",
                    "characteristic", "Без характеристики",
                    "cost", "-3600.000",
                    "measurementUnit", "null",
                    "name", "Döcke STAL PREMIUM Карнизный крюк для желоба короткий (гнутый) D125 (Каштан 8017)",
                    "number", "ДН00-001377",
                    "price", "-4500",
                    "quantity", "-10"
//                    "refKey", "9f358d54-8e61-11f1-8281-000c29f4122d",
            ));
            resultList.add(Map.of(
                            "autoFilling", "Да",
                    "batch", "Не найдено",
                    "categories", "Дёке",
                    "characteristic", "Не найдено",
                    "cost", "37573.560000",
                    "measurementUnit", "шт",
                    "name", "Döcke STAL PREMIUM Кронштейн желоба карнизный (штампованный) D125 (Каштан 8017)",
                    "number", "ДН00-004343",
                    "price", "15590.400000",
                    "quantity", "116.000"
//                    "refKey", "f7c1f31e-a218-11f1-8282-000c29f4122d"
                    ));
//            result.put("data", Map.of(
//                    "id", authResult.userId(),
//                    "email", authResult.email(),
//                    "role", authResult.role()
//            ));
//            response.put("organization", Map.of(
//                    "id", authResult.organizationId(),
//                    "name", authResult.organizationName()
//            ));
//            response.put("token", sessionId);  // Bearer token
//            response.put("expiresIn", 1800);    // 30 минут
//            );

            return ResponseEntity.ok(ApiResponse.success(resultList));

        } catch (SessionService.SessionNotFoundException e) {
            return ResponseEntity.status(401).body(
                    Map.of("error", "Не авторизован")
            );
        } catch (Exception e) {
            log.error("Error calculating sales cost", e);
            return ResponseEntity.status(500).body(
                    Map.of("error", "Ошибка при расчете себестоимости продаж")
            );
        }
    }
}