package com.example.code_executor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionResponse {
    private boolean success;
    private List<String> outputs;
    private String errorMessage;
    private long buildTimeMs;
    private long executionTimeMs;
}
