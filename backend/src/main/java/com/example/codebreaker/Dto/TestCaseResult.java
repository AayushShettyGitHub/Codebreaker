package com.example.codebreaker.Dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TestCaseResult {
    private Long testCaseId;
    private boolean passed;
    private String error;
}
