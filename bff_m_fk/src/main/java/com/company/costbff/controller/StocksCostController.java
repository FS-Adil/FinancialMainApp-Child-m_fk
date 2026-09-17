package com.company.costbff.controller;

import com.company.costbff.dto.request.SalesCostRequest;
import com.company.costbff.dto.request.StocksCostRequest;
import com.company.costbff.dto.response.ApiResponse;
import com.company.costbff.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/cost")
@RequiredArgsConstructor
public class StocksCostController {

    private final SessionService sessionService;

    @PostMapping("/stocks")
    public ResponseEntity<?> calculateStocksCost(
            @Valid @RequestBody StocksCostRequest request,
            HttpServletRequest httpRequest) {

        String orgUUID;

        var userContext = sessionService.getUserContext(httpRequest);

        String contextOrganizationId = userContext.organizationId();

        LocalDateTime dateTime = request.date();

        log.info("Stocks cost calculation requested: user={}, org={}, period= to {}",
                userContext.userId(), contextOrganizationId, dateTime);

        if (contextOrganizationId.equals("Admin_plus")) {
            orgUUID = request.organizationId();
        } else if (contextOrganizationId.equals(request.organizationId())) {
            orgUUID = contextOrganizationId;
        } else {
            return ResponseEntity.status(500).body(
                    Map.of("error", "Пользователь не привязан к организации")
            );
        }

        List<Map<String, String>> resultList = new ArrayList<>();

        resultList.add(Map.of("batch", "Не найдено",
                "characteristic", "Не найдено",
                "cost", "75348.000",
                "measurementUnit", "шт",
                "name", "Aquasystem Крюк крепления желоба короткий 90/125 RR23 PUR MATT",
                "quantity", "117.000",
                "refKey", "e79c6ee7-3be9-11ec-815c-000c29f4122d"
        ));

        resultList.add(Map.of("batch", "Не найдено",
                "characteristic", "Не найдено",
                "cost", "700.000",
                "measurementUnit", "шт",
                "name", "Döcke LUX Колено 45˚ (Шоколад)",
                "quantity", "1.000",
                "refKey", "e79c6ee7-3be9-11ec-815c-000c29f4122d"
        ));

        return ResponseEntity.ok(ApiResponse.success(resultList));
    }
}
