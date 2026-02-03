package com.example.codebreaker.controller;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.services.PlayerService;
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

    return roomPlayers.stream()
            .map(rp -> Map.<String, Object>of(
                    "id", rp.getPlayer().getId(),
                    "username", rp.getPlayer().getUsername(),
                    "role", rp.getPlayer().getRole(),
                    "score", rp.getScore(),
                    "hasAnsweredCorrectly", rp.isHasAnsweredCorrectly()
            ))
            .collect(Collectors.toList());
}

    @GetMapping("/me/badges")
    public List<Map<String, Object>> getMyBadges() {
        Player me = service.getAuthenticatedPlayer().orElseThrow(() -> new RuntimeException("Not logged in"));
        return badgeService.getBadgesForPlayer(me).stream()
                .map(pb -> Map.<String, Object>of(
                        "key", pb.getBadge().getKey(),
                        "name", pb.getBadge().getName(),
                        "description", pb.getBadge().getDescription(),
                        "awardedAt", pb.getAwardedAt()
                ))
                .collect(Collectors.toList());
    }
}

