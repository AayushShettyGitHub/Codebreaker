package com.example.codebreaker.Dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TestCaseResult {
    private Long testCaseId;
    private boolean passed;
    private String error;
    private String expectedOutput;
    private String actualOutput;
    private String input;
}
