package com.example.codebreaker.Dto;

import com.example.codebreaker.model.Problem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemResponse {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private List<TestCaseResponse> testCases;
    private Long createdAt;

    public static ProblemResponse fromEntity(Problem problem) {
        if (problem == null) return null;
        
        List<TestCaseResponse> filteredTestCases = problem.getTestCases().stream()
                .filter(tc -> !tc.isHidden())
                .map(tc -> TestCaseResponse.builder()
                        .id(tc.getId())
                        .input(tc.getInput())
                        .output(tc.getOutput())
                        .build())
                .collect(Collectors.toList());

        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty())
                .testCases(filteredTestCases)
                .createdAt(problem.getCreatedAt())
                .build();
    }
}
