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
public class PlayerProfileResponse {
    private Long id;
    private String username;
    private String role;
    private List<String> featuredBadges;
    private List<BadgeResponse> badges;
}
