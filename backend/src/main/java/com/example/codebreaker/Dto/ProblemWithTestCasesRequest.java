package com.example.codebreaker.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemWithTestCasesRequest {
    private String title;
    private String description;
    private String difficulty;
    private List<TestCaseRequest> testCases;
    private List<TestCaseRequest> hiddenTestCases;
    private Long libraryProblemId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TestCaseRequest {
        private String input;
        private String output;
    }
}
