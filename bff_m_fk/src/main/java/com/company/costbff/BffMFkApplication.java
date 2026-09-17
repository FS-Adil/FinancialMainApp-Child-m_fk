package com.company.costbff;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Главный класс BFF приложения
 *
 * Решает проблемы:
 * 1. Запуск Spring Boot приложения
 * 2. Включение кэширования
 * 3. Включение планировщика для очистки сессий
 */
@SpringBootApplication
@EnableScheduling
public class BffMFkApplication {

	public static void main(String[] args) {
		SpringApplication.run(BffMFkApplication.class, args);
	}

}
