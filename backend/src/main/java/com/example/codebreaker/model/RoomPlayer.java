package com.example.codebreaker.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonIgnore
    private Room room;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @Builder.Default
    private int score = 0;

    @Builder.Default
    private boolean hasAnsweredCorrectly = false;

    @Builder.Default
    private Long correctAnswerTimestamp = null;

    private LocalDateTime lastCorrectSubmissionTime;
}
