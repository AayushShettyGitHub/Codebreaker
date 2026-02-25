package com.example.codebreaker.Dto;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerResponse {
    private Long id;
    private String username;
    private String role;
    private Integer publicRoomsPlayedCount;
    private Integer totalWins;
    private Integer currentWinStreak;
    private Integer totalProblemsSolved;
    private Integer totalProblemsContributed;
    private Integer totalCorrectSubmissions;
    private Integer totalSubmissions;
    private List<String> featuredBadges;

    public static PlayerResponse fromEntity(Player player) {
        if (player == null) return null;
        return PlayerResponse.builder()
                .id(player.getId())
                .username(player.getUsername())
                .role(player.getRole() != null ? player.getRole().name() : null)
                .publicRoomsPlayedCount(player.getPublicRoomsPlayedCount())
                .totalWins(player.getTotalWins())
                .currentWinStreak(player.getCurrentWinStreak())
                .totalProblemsSolved(player.getTotalProblemsSolved())
                .totalProblemsContributed(player.getTotalProblemsContributed())
                .totalCorrectSubmissions(player.getTotalCorrectSubmissions())
                .totalSubmissions(player.getTotalSubmissions())
                .featuredBadges(player.getFeaturedBadges())
                .build();
    }
}
