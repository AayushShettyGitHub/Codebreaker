package com.example.codebreaker.controller;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.services.PlayerService;
import com.example.codebreaker.services.RoomService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService service;
    private final RoomService roomService;

    public PlayerController(PlayerService service, RoomService roomService) {
        this.service = service;
        this.roomService = roomService;
    }


    /* ===== ROOM LOGIC ===== */

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

        return roomService.joinRoom(roomId, playerId);
    }

    @GetMapping("/room/{roomId}")
    public List<Player> listPlayers(@PathVariable Long roomId) {
        return service.getPlayers(roomId);
    }
}
