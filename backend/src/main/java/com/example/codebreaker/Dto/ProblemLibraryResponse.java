package com.example.codebreaker.Dto;

import com.example.codebreaker.model.ProblemLibrary;
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
public class ProblemLibraryResponse {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private List<String> tags;
    private List<TestCaseResponse> testCases;
    private Long createdAt;

    public static ProblemLibraryResponse fromEntity(ProblemLibrary library) {
        if (library == null) return null;

        List<TestCaseResponse> filteredTestCases = library.getTestCases().stream()
                .map(tc -> TestCaseResponse.builder()
                        .id(tc.getId())
                        .input(tc.getInput())
                        .output(tc.getOutput())
                        .build())
                .collect(Collectors.toList());

        return ProblemLibraryResponse.builder()
                .id(library.getId())
                .title(library.getTitle())
                .description(library.getDescription())
                .difficulty(library.getDifficulty())
                .tags(library.getTags())
                .testCases(filteredTestCases)
                .createdAt(library.getCreatedAt())
                .build();
    }
}
