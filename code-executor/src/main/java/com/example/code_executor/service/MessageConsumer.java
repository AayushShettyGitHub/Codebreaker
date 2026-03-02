package com.example.code_executor.service;

import com.example.code_executor.config.RabbitMQConfig;
import com.example.code_executor.dto.ExecutionRequest;
import com.example.code_executor.dto.ExecutionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageConsumer {

    private final CodeExecutor executor;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public ExecutionResponse consumeMessage(ExecutionRequest request) {
        log.info("Received execution request via RabbitMQ for language: {}", request.getLanguage());
        try {
            return executor.execute(request);
        } catch (Exception e) {
            log.error("Error during RabbitMQ execution", e);
            return ExecutionResponse.builder()
                    .success(false)
                    .errorMessage("Internal Executor Error: " + e.getMessage())
                    .build();
        }
    }
}
