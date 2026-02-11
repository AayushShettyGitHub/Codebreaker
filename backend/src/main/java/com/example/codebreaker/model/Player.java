package com.example.codebreaker.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonIgnore
    private Room room;

    @Builder.Default
    private Integer publicRoomsPlayedCount = 0;

    @Builder.Default
    private Integer totalWins = 0;

    @Builder.Default
    private Integer currentWinStreak = 0;

    @Builder.Default
    private Integer totalProblemsSolved = 0;

    @Builder.Default
    private Integer totalProblemsContributed = 0;

    @Builder.Default
    private Integer totalCorrectSubmissions = 0;

    @Builder.Default
    private Integer totalSubmissions = 0;

    @ElementCollection
    @CollectionTable(name = "player_featured_badges", joinColumns = @JoinColumn(name = "player_id"))
    @Column(name = "badge_key")
    @Builder.Default
    private java.util.List<String> featuredBadges = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @Builder.Default
    private java.util.List<PlayerBadge> badges = new java.util.ArrayList<>();
}
