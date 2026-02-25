package com.example.code_executor.controller;

import com.example.code_executor.dto.ExecutionRequest;
import com.example.code_executor.dto.ExecutionResponse;
import com.example.code_executor.service.LocalCodeExecutor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/execute")
@RequiredArgsConstructor
public class ExecutorController {

    private final LocalCodeExecutor executor;

    @PostMapping
    public ExecutionResponse execute(@RequestBody ExecutionRequest request) {
        return executor.execute(request);
    }
}
