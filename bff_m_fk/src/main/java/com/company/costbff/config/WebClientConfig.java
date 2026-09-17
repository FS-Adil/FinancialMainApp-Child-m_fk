package com.company.costbff.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

/**
 * Конфигурация WebClient для взаимодействия с микросервисами
 *
 * Решает проблемы:
 * 1. Настройка таймаутов
 * 2. Добавление служебных заголовков
 * 3. Разные конфигурации для разных сервисов
 */
@Configuration
public class WebClientConfig {

    @Value("${app.services.auth-service.url}")
    private String authServiceUrl;

    @Value("${app.services.cost-service.url}")
    private String costServiceUrl;

    @Value("${app.services.auth-service.service-token}")
    private String authServiceToken;

    /**
     * WebClient для Auth Service
     * BFF идентифицирует себя через X-Service-Token
     */
    @Bean("authServiceWebClient")
    public WebClient authServiceWebClient() {
        return WebClient.builder()
                .baseUrl(authServiceUrl)
                .defaultHeader("X-Service-Token", authServiceToken)
                .defaultHeader("X-Service-Name", "cost-calculation-bff")
                .clientConnector(new ReactorClientHttpConnector(createHttpClient()))
                .build();
    }

    /**
     * WebClient для Cost Service
     * Микросервис ПОЛНОСТЬЮ ДОВЕРЯЕТ BFF
     * BFF передает только контекст пользователя
     */
    @Bean("costServiceWebClient")
    public WebClient costServiceWebClient() {
        return WebClient.builder()
                .baseUrl(costServiceUrl)
                .defaultHeader("X-Service-Name", "cost-calculation-bff")
                .clientConnector(new ReactorClientHttpConnector(createHttpClient()))
                .build();
    }

    /**
     * Создание HTTP клиента с таймаутами
     */
    private HttpClient createHttpClient() {
        return HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                .responseTimeout(Duration.ofSeconds(30))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(30))
                        .addHandlerLast(new WriteTimeoutHandler(30)));
    }
}