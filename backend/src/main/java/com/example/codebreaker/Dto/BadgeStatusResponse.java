package com.example.codebreaker.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeStatusResponse {
    private String key;
    private String name;
    private String description;
    private String awardedAt;
    private int count;
    private String rank;
    private Integer progressPercent;
    private Boolean featured;
}
