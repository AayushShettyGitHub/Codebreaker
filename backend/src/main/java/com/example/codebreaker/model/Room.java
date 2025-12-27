package com.example.codebreaker.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private boolean privateRoom = false;

    private String name;

    @OneToOne
    @JoinColumn(name = "admin_id")
    private Player admin;

    @OneToOne(
        mappedBy = "room",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    private Problem currentProblem;

    @Column(unique = true, nullable = false)
    private String joinCode;

    @Builder.Default
    private Integer maxCorrectAnswers = 1;

    @Builder.Default
    private Integer correctAnswerCount = 0;

    @OneToMany(
        mappedBy = "room",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<RoomPlayer> players = new ArrayList<>();
}
