package com.example.codebreaker.Dto.executor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutorRequest {
    private String language;
    private String code;
    private List<String> inputs;
}
