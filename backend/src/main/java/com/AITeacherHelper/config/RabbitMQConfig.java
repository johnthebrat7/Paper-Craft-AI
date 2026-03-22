package com.AITeacherHelper.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${app.rabbitmq.exchanges.main}")
    private String mainExchange;

    @Value("${app.rabbitmq.queues.generation}")
    private String generationQueue;

    @Value("${app.rabbitmq.queues.pdf}")
    private String pdfQueue;

    @Value("${app.rabbitmq.routing-keys.generation}")
    private String generationRoutingKey;

    @Value("${app.rabbitmq.routing-keys.pdf}")
    private String pdfRoutingKey;

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(mainExchange, true, false);
    }

    @Bean
    public Queue generationQueue() {
        return QueueBuilder.durable(generationQueue).build();
    }

    @Bean
    public Queue pdfQueue() {
        return QueueBuilder.durable(pdfQueue).build();
    }

    @Bean
    public Binding generationBinding(Queue generationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(generationQueue).to(exchange).with(generationRoutingKey);
    }

    @Bean
    public Binding pdfBinding(Queue pdfQueue, DirectExchange exchange) {
        return BindingBuilder.bind(pdfQueue).to(exchange).with(pdfRoutingKey);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
