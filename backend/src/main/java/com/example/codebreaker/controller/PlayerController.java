package com.example.codebreaker.controller;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.services.PlayerService;
import com.example.codebreaker.Dto.PlayerProfileResponse;
import com.example.codebreaker.Dto.BadgeResponse;
import com.example.codebreaker.Dto.FeaturedBadgesRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService service;
    private final com.example.codebreaker.services.BadgeService badgeService;

    public PlayerController(PlayerService service, com.example.codebreaker.services.BadgeService badgeService) {
        this.service = service;
        this.badgeService = badgeService;
    }

    @PostMapping("/join/{roomId}")
    public Player joinRoom(
            @PathVariable Long roomId,
            @RequestBody Map<String, String> payload
    ) {
        if (payload == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body required");
        }

        String idStr = payload.get("playerId");
        Long playerId = null;
        if (idStr != null) {
            try {
                playerId = Long.valueOf(idStr);
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId must be a number");
            }
        }

        if (playerId == null) {
            String username = payload.get("username");
            if (username != null) {
                playerId = service.findByUsername(username)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"))
                        .getId();
            }
        }

        if (playerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId or username is required");
        }

        return service.joinRoom(roomId, playerId);
    }

   @GetMapping("/room/{roomId}")
public List<Map<String, Object>> listPlayers(@PathVariable Long roomId) {
    List<RoomPlayer> roomPlayers = service.getRoomPlayers(roomId);

    return roomPlayers.stream().map(rp -> {
        java.util.List<com.example.codebreaker.model.PlayerBadge> pbs = badgeService.getBadgesForPlayer(rp.getPlayer());
        java.util.List<Map<String, Object>> badges = pbs.stream()
                .map(pb -> {
                    Integer count = pb.getCount() == null ? 1 : pb.getCount();
                    String rank = pb.getRank() == null ? "BRONZE" : pb.getRank();
                    boolean featured = rp.getPlayer().getFeaturedBadges() != null && rp.getPlayer().getFeaturedBadges().contains(pb.getBadge().getKey());
                    return Map.<String, Object>of(
                            "key", pb.getBadge().getKey(),
                            "name", pb.getBadge().getName(),
                            "count", count,
                            "rank", rank,
                            "featured", featured
                    );
                }).limit(3).collect(Collectors.toList());

        return Map.<String, Object>of(
                "id", rp.getPlayer().getId(),
                "username", rp.getPlayer().getUsername(),
                "role", rp.getPlayer().getRole(),
                "score", rp.getScore(),
                "hasAnsweredCorrectly", rp.isHasAnsweredCorrectly(),
                "badges", badges
        );
    }).collect(Collectors.toList());
}

    @GetMapping("/me/badges")
    public List<Map<String, Object>> getMyBadges() {
        Player me = service.getAuthenticatedPlayer().orElseThrow(() -> new RuntimeException("Not logged in"));
        return badgeService.getBadgesForPlayer(me).stream().map(pb -> {
            Integer count = pb.getCount() == null ? 1 : pb.getCount();
            String rank = pb.getRank() == null ? "BRONZE" : pb.getRank();
            Integer nextThreshold = badgeService.getNextThreshold(count);
            int progress = nextThreshold == null || nextThreshold == 0 ? 100 : (int) Math.min(100, Math.floor((count * 100.0) / nextThreshold));
            return Map.<String, Object>of(
                    "key", pb.getBadge().getKey(),
                    "name", pb.getBadge().getName(),
                    "description", pb.getBadge().getDescription(),
                    "awardedAt", pb.getAwardedAt() != null ? pb.getAwardedAt().toString() : null,
                    "count", count,
                    "rank", rank,
                    "progressPercent", progress
            );
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Map<String, Object> getPlayerProfile(@PathVariable Long id) {
        Player player = service.findById(id).orElseThrow(() -> new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Player not found"));
        java.util.List<com.example.codebreaker.model.PlayerBadge> pbs = badgeService.getBadgesForPlayer(player);
        java.util.List<Map<String, Object>> badges = pbs.stream().map(pb -> Map.<String, Object>of(
                "key", pb.getBadge().getKey(),
                "name", pb.getBadge().getName(),
                "description", pb.getBadge().getDescription(),
                "awardedAt", pb.getAwardedAt() != null ? pb.getAwardedAt().toString() : null,
                "count", pb.getCount(),
                "rank", pb.getRank()
        )).collect(Collectors.toList());

        return Map.of(
                "id", player.getId(),
                "username", player.getUsername(),
                "role", player.getRole(),
                "badges", badges
        );
    }

    @GetMapping("/me")
    public PlayerProfileResponse getMyProfile() {
        Player me = service.getAuthenticatedPlayer().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
        java.util.List<com.example.codebreaker.model.PlayerBadge> pbs = badgeService.getBadgesForPlayer(me);
        java.util.List<BadgeResponse> badges = pbs.stream().map(pb -> {
            Integer count = pb.getCount() == null ? 1 : pb.getCount();
            String rank = pb.getRank() == null ? "BRONZE" : pb.getRank();
            Integer nextThreshold = badgeService.getNextThreshold(count);
            int progress = nextThreshold == null || nextThreshold == 0 ? 100 : (int) Math.min(100, Math.floor((count * 100.0) / nextThreshold));
            return BadgeResponse.builder()
                    .key(pb.getBadge().getKey())
                    .name(pb.getBadge().getName())
                    .description(pb.getBadge().getDescription())
                    .awardedAt(pb.getAwardedAt() != null ? pb.getAwardedAt().toString() : null)
                    .count(count)
                    .rank(rank)
                    .progressPercent(progress)
                    .build();
        }).collect(Collectors.toList());
        
        return PlayerProfileResponse.builder()
                .id(me.getId())
                .username(me.getUsername())
                .role(me.getRole().toString())
                .featuredBadges(me.getFeaturedBadges())
                .badges(badges)
                .build();
    }

    @PostMapping("/me/featured")
    public Map<String, Object> setFeaturedBadges(@RequestBody FeaturedBadgesRequest request) {
        List<String> selected = request.getBadges();
        if (selected.size() > 3) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At most 3 badges can be featured");
        Player player = service.getAuthenticatedPlayer().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
        player.setFeaturedBadges(new java.util.ArrayList<>(selected));
        service.save(player);

        return Map.of("status","ok","featured", player.getFeaturedBadges());
    }
}

