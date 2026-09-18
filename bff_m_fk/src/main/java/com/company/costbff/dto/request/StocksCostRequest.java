package com.company.costbff.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

public record StocksCostRequest(
        @NotNull(message = "Дата обязательна")
        @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime date,

        @NotBlank(message = "ID организации обязателен")
        String organizationId
) {}
