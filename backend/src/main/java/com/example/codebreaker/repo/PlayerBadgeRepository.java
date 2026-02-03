package com.example.codebreaker.repo;

import com.example.codebreaker.model.PlayerBadge;
import com.example.codebreaker.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerBadgeRepository extends JpaRepository<PlayerBadge, Long> {
    List<PlayerBadge> findByPlayer(Player player);
    boolean existsByPlayerAndBadge_Key(Player player, String key);
}
