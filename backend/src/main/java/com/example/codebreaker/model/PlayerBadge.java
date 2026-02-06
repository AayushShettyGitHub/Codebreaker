package com.example.codebreaker.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @ManyToOne
    @JoinColumn(name = "badge_id")
    private Badge badge;

    private LocalDateTime awardedAt;

    private Integer count = 1;
    private String rank = "BRONZE";

    @PrePersist
    public void prePersist() {
        if (awardedAt == null) awardedAt = LocalDateTime.now();
        if (count == null) count = 1;
        if (rank == null) rank = "BRONZE";
    }
}
