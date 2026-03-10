package com.example.codebreaker.controller;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.services.BadgeService;
import com.example.codebreaker.services.PlayerService;
import com.example.codebreaker.repo.BadgeRepository;
import com.example.codebreaker.Dto.BadgeResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.example.codebreaker.Dto.*;
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
    public List<BadgeLibraryEntry> listAllBadges() {
        return badgeRepo.findAll().stream().map(b -> BadgeLibraryEntry.builder()
                .key(b.getKey())
                .name(b.getName())
                .description(b.getDescription())
                .category(b.getCategory().name())
                .build()).collect(Collectors.toList());
    }

    @GetMapping("/me")
    public List<BadgeResponse> myBadgesWithStatus() {
        Player me = playerService.getAuthenticatedPlayer().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));

        List<com.example.codebreaker.model.PlayerBadge> myBadges = badgeService.getBadgesForPlayer(me);
        java.util.Map<String, Map<String, Object>> pbMap = myBadges.stream()
                .collect(Collectors.toMap(pb -> pb.getBadge().getKey(), pb -> {
                    Integer count = ((com.example.codebreaker.model.PlayerBadge) pb).getCount();
                    if (count == null) count = 0;
                    String rank = ((com.example.codebreaker.model.PlayerBadge) pb).getRank();
                    if (rank == null) rank = "NONE";
                    Integer nextThreshold = badgeService.getNextThreshold(count);
                    int progress = nextThreshold == null || nextThreshold == 0 ? 100 : (int) Math.min(100, Math.floor((count * 100.0) / nextThreshold));
                    String nextRank = badgeService.computeRank(nextThreshold);
                    java.util.Map<String, Object> m = new java.util.HashMap<>();
                    m.put("awardedAt", pb.getAwardedAt() != null ? pb.getAwardedAt().toString() : null);
                    m.put("count", count);
                    m.put("rank", rank);
                    m.put("progressPercent", progress);
                    m.put("nextThreshold", nextThreshold);
                    m.put("nextRank", nextRank);
                    return m;
                }));

        return badgeRepo.findAll().stream().map(b -> {
            Map<String, Object> extra = pbMap.get(b.getKey());
            
            
            Integer count = extra != null ? (Integer) extra.get("count") : 0;
            Integer nextThreshold = extra != null ? (Integer) extra.get("nextThreshold") : null;
            String rank = extra != null ? (String) extra.get("rank") : "NONE";
            
            
            if (nextThreshold == null) {
                switch (b.getKey()) {
                    case "SOLVER_10":
                        nextThreshold = 10;
                        if (extra == null) {
                            count = me.getTotalProblemsSolved() == null ? 0 : me.getTotalProblemsSolved();
                        }
                        break;
                    case "SOLVER_50":
                        nextThreshold = 50;
                        if (extra == null) {
                            count = me.getTotalProblemsSolved() == null ? 0 : me.getTotalProblemsSolved();
                        }
                        break;
                    case "ACCURACY_90":
                        nextThreshold = 90;
                        if (extra == null) {
                            int totalCorrect = me.getTotalCorrectSubmissions() == null ? 0 : me.getTotalCorrectSubmissions();
                            int totalSubmissions = me.getTotalSubmissions() == null ? 0 : me.getTotalSubmissions();
                            if (totalSubmissions >= 10) {
                                double accuracy = (double) totalCorrect / totalSubmissions;
                                count = (int) Math.round(accuracy * 100);
                            } else {
                                count = totalSubmissions;
                                nextThreshold = 10; 
                            }
                        }
                        break;
                    case "3_WIN_STREAK":
                        nextThreshold = 3;
                        if (extra == null) {
                            count = me.getCurrentWinStreak() == null ? 0 : me.getCurrentWinStreak();
                        }
                        break;
                    case "7_WIN_STREAK":
                        nextThreshold = 7;
                        if (extra == null) {
                            count = me.getCurrentWinStreak() == null ? 0 : me.getCurrentWinStreak();
                        }
                        break;
                    case "5_WINS":
                        nextThreshold = 5;
                        if (extra == null) {
                            count = me.getTotalWins() == null ? 0 : me.getTotalWins();
                        }
                        break;
                    case "FIRST_PUBLIC_ROOM":
                        nextThreshold = 1;
                        if (extra == null) {
                            count = me.getPublicRoomsPlayedCount() == null ? 0 : (me.getPublicRoomsPlayedCount() > 0 ? 1 : 0);
                        }
                        break;
                    case "5_PUBLIC_ROOMS":
                        nextThreshold = 5;
                        if (extra == null) {
                            count = me.getPublicRoomsPlayedCount() == null ? 0 : me.getPublicRoomsPlayedCount();
                        }
                        break;
                    case "10_PUBLIC_ROOMS":
                        nextThreshold = 10;
                        if (extra == null) {
                            count = me.getPublicRoomsPlayedCount() == null ? 0 : me.getPublicRoomsPlayedCount();
                        }
                        break;
                    case "CONTRIBUTOR":
                        nextThreshold = 1;
                        if (extra == null) {
                            count = me.getTotalProblemsContributed() == null ? 0 : me.getTotalProblemsContributed();
                        }
                        break;
                    default:
                        
                        nextThreshold = badgeService.getNextThreshold(count);
                        break;
                }
            }
            
            int progress = nextThreshold == null || nextThreshold == 0 ? 100 : (int) Math.min(100, Math.floor((count * 100.0) / nextThreshold));
            String nextRank = badgeService.computeRank(nextThreshold);
            return BadgeResponse.builder()
                    .key(b.getKey())
                    .name(b.getName())
                    .description(b.getDescription())
                    .category(b.getCategory().toString())
                    .earned(extra != null)
                    .awardedAt(extra != null ? (String) extra.get("awardedAt") : null)
                    .count(count)
                    .rank(rank)
                    .progressPercent(progress)
                    .nextThreshold(nextThreshold)
                    .nextRank(nextRank)
                    .build();
        }).collect(Collectors.toList());
    }
}
