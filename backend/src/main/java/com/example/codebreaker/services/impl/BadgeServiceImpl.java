package com.example.codebreaker.services.impl;

import com.example.codebreaker.model.Badge;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.PlayerBadge;
import com.example.codebreaker.model.BadgeCategory;
import com.example.codebreaker.repo.BadgeRepository;
import com.example.codebreaker.repo.PlayerBadgeRepository;
import com.example.codebreaker.services.BadgeService;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

@Service
public class BadgeServiceImpl implements BadgeService {

    private final BadgeRepository badgeRepo;
    private final PlayerBadgeRepository playerBadgeRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public BadgeServiceImpl(BadgeRepository badgeRepo, PlayerBadgeRepository playerBadgeRepo, SimpMessagingTemplate messagingTemplate) {
        this.badgeRepo = badgeRepo;
        this.playerBadgeRepo = playerBadgeRepo;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public PlayerBadge awardBadge(Player player, String badgeKey, String badgeName, String description, BadgeCategory category) {
        Badge badge = getOrCreateBadge(badgeKey, badgeName, description, category);

        // if player already has this badge, increment counter and update rank
        PlayerBadge existing = playerBadgeRepo.findByPlayer(player).stream()
                .filter(pb -> pb.getBadge().getKey().equals(badgeKey))
                .findFirst().orElse(null);

        if (existing != null) {
            existing.setCount(existing.getCount() == null ? 1 : existing.getCount() + 1);
            existing.setRank(computeRank(existing.getCount()));
            playerBadgeRepo.save(existing);

            // notify clients about badge count update
            try {
                java.util.Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("type", "BADGE_UPDATED");
                payload.put("playerId", player.getId());
                java.util.Map<String, Object> b = new java.util.HashMap<>();
                b.put("key", badge.getKey());
                b.put("name", badge.getName());
                b.put("description", badge.getDescription());
                b.put("category", badge.getCategory());
                b.put("count", existing.getCount());
                b.put("rank", existing.getRank());
                payload.put("badge", b);

                messagingTemplate.convertAndSend("/topic/badges", payload);
            } catch (Exception ignored) { }

            return existing;
        }

        PlayerBadge pb = PlayerBadge.builder()
                .player(player)
                .badge(badge)
                .count(1)
                .rank(computeRank(1))
                .build();

        playerBadgeRepo.save(pb);

        // notify clients about awarded badge
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("type", "BADGE_AWARDED");
            payload.put("playerId", player.getId());
            java.util.Map<String, Object> b = new java.util.HashMap<>();
            b.put("key", badge.getKey());
            b.put("name", badge.getName());
            b.put("description", badge.getDescription());
            b.put("category", badge.getCategory());
            b.put("count", pb.getCount());
            b.put("rank", pb.getRank());
            payload.put("badge", b);
            payload.put("awardedAt", pb.getAwardedAt() != null ? pb.getAwardedAt().toString() : null);

            messagingTemplate.convertAndSend("/topic/badges", payload);
        } catch (Exception ignored) { }

        return pb;
    }

    public String computeRank(Integer count) {
        if (count == null || count <= 0) return "NONE";
        if (count >= 20) return "PLATINUM";
        if (count >= 10) return "DIAMOND";
        if (count >= 5) return "GOLD";
        if (count >= 3) return "SILVER";
        return "BRONZE";
    }

    public Integer getNextThreshold(Integer count) {
        if (count == null || count < 1) return 1; // to get BRONZE
        if (count < 3) return 3; // SILVER
        if (count < 5) return 5; // GOLD
        if (count < 10) return 10; // DIAMOND
        if (count < 20) return 20; // PLATINUM
        return count + 1; // continue counting beyond PLATINUM
    }

    @Override
    public boolean playerHasBadge(Player player, String badgeKey) {
        return playerBadgeRepo.existsByPlayerAndBadge_Key(player, badgeKey);
    }

    @Override
    public List<PlayerBadge> getBadgesForPlayer(Player player) {
        return playerBadgeRepo.findByPlayer(player);
    }

    @Override
    public Badge getOrCreateBadge(String key, String name, String description, BadgeCategory category) {
        return badgeRepo.findByKey(key).orElseGet(() -> {
            Badge b = Badge.builder()
                    .key(key)
                    .name(name)
                    .description(description)
                    .category(category)
                    .build();
            return badgeRepo.save(b);
        });
    }
}
