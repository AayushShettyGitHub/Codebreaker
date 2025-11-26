package com.example.codebreaker.controller;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.services.PlayerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService service;

    public PlayerController(PlayerService service) {
        this.service = service;
    }

    @PostMapping("/join/{roomId}")
    public Player joinRoom(
            @PathVariable Long roomId,
            @RequestParam String username
    ) {
        return service.joinRoom(roomId, username);
    }

    @GetMapping("/room/{roomId}")
    public List<Player> listPlayers(@PathVariable Long roomId) {
        return service.getPlayers(roomId);
    }
}
