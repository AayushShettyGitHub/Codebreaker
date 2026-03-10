package com.example.codebreaker.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomPlayerResponse {
    private Long id;
    private String username;
    private String role;
    private int score;
    private boolean hasAnsweredCorrectly;
    private List<BadgeStatusResponse> badges;
}
