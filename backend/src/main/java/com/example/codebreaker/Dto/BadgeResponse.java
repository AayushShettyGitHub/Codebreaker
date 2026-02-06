package com.example.codebreaker.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeResponse {
    private String key;
    private String name;
    private String description;
    private String category;
    private boolean earned;
    private String awardedAt;
    private Integer count;
    private String rank;
    private Integer progressPercent;
    private Integer nextThreshold;
    private String nextRank;
}
