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
        if (playerHasBadge(player, badgeKey)) return null;

        Badge badge = getOrCreateBadge(badgeKey, badgeName, description, category);

        PlayerBadge pb = PlayerBadge.builder()
                .player(player)
                .badge(badge)
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
            payload.put("badge", b);
            payload.put("awardedAt", pb.getAwardedAt());

            messagingTemplate.convertAndSend("/topic/badges", payload);
        } catch (Exception ignored) { }

        return pb;
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
