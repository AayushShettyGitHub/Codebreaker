package com.example.codebreaker.services;

import com.example.codebreaker.model.Badge;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.PlayerBadge;

import java.util.List;

public interface BadgeService {
    PlayerBadge awardBadge(Player player, String badgeKey, String badgeName, String description, com.example.codebreaker.model.BadgeCategory category);
    boolean playerHasBadge(Player player, String badgeKey);
    List<PlayerBadge> getBadgesForPlayer(Player player);
    Badge getOrCreateBadge(String key, String name, String description, com.example.codebreaker.model.BadgeCategory category);
}
