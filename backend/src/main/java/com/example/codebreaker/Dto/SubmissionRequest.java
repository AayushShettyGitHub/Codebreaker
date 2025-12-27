package com.example.codebreaker.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionRequest {
    private Long problemId;
    private Long playerId;
    private Long roomId;
    private String code;
    private String language; // "java", "python", "javascript", "cpp"
}
