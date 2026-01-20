package com.example.codebreaker.Dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SubmissionResult {
    private Long problemId;
    private Long playerId;
    private List<TestCaseResult> results;
    private boolean allPassed;
    private int score;
    private Integer maxCorrectAnswers;
    private Integer correctAnswerCount;
}
