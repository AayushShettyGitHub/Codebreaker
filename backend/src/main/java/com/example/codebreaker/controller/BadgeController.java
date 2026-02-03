package com.example.codebreaker.controller;

import com.example.codebreaker.model.Badge;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.services.BadgeService;
import com.example.codebreaker.services.PlayerService;
import com.example.codebreaker.repo.BadgeRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    private final BadgeRepository badgeRepo;
    private final BadgeService badgeService;
    private final PlayerService playerService;

    public BadgeController(BadgeRepository badgeRepo, BadgeService badgeService, PlayerService playerService) {
        this.badgeRepo = badgeRepo;
        this.badgeService = badgeService;
        this.playerService = playerService;
    }

    @GetMapping
    public List<Map<String, Object>> listAllBadges() {
        return badgeRepo.findAll().stream().map(b -> Map.<String, Object>of(
                "key", b.getKey(),
                "name", b.getName(),
                "description", b.getDescription(),
                "category", b.getCategory()
        )).collect(Collectors.toList());
    }

    @GetMapping("/me")
    public List<Map<String, Object>> myBadgesWithStatus() {
        Player me = playerService.getAuthenticatedPlayer().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));

        List<com.example.codebreaker.model.PlayerBadge> myBadges = badgeService.getBadgesForPlayer(me);
        java.util.Map<String, java.time.LocalDateTime> awardedMap = myBadges.stream()
                .collect(Collectors.toMap(pb -> pb.getBadge().getKey(), pb -> pb.getAwardedAt()));

        return badgeRepo.findAll().stream().map(b -> Map.<String, Object>of(
                "key", b.getKey(),
                "name", b.getName(),
                "description", b.getDescription(),
                "category", b.getCategory(),
                "earned", awardedMap.containsKey(b.getKey()),
                "awardedAt", awardedMap.get(b.getKey())
        )).collect(Collectors.toList());
    }
}
