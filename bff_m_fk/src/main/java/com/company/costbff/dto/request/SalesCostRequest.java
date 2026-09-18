package com.company.costbff.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

/**
 * DTO запроса расчета себестоимости продаж
 */
public record SalesCostRequest(
        @NotNull(message = "Дата начала обязательна")
        @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime startDate,

        @NotNull(message = "Дата окончания обязательна")
        @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime endDate,

        @NotBlank(message = "ID организации обязателен")
        String organizationId
) {}