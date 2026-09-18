package com.company.costbff.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Конфигурация Redis (опционально)
 *
 * Используется только если нужна кастомная сериализация.
 * По умолчанию Spring Boot автоконфигурация создает RedisTemplate
 * с JdkSerializationRedisSerializer (подходит для Serializable объектов).
 *
 * Решает проблемы:
 * 1. Хранение сессий пользователей
 * 2. JSON сериализация вместо Java serialization (опционально)
 * 3. Автоматическое удаление истекших сессий (TTL)
 */
@Configuration
public class RedisConfig {

    /**
     * Кастомный RedisTemplate с JSON сериализацией
     *
     * ВАЖНО: Не используйте GenericJackson2JsonRedisSerializer!
     * Используйте RedisSerializer.json() для современной JSON сериализации.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory) {

        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Ключи - строки
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Значения - JSON (современный подход, не deprecated)
        // RedisSerializer.json() использует Jackson2JsonRedisSerializer
        template.setValueSerializer(RedisSerializer.json());
        template.setHashValueSerializer(RedisSerializer.json());

        template.afterPropertiesSet();
        return template;
    }
}