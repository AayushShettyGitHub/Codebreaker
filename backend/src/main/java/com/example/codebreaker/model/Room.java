package com.example.codebreaker.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
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

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_id")
    private Player admin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_problem_id")
    private Problem currentProblem;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Problem> problems = new ArrayList<>();

    @Column(unique = true, nullable = false)
    private String joinCode;

    @Builder.Default
    private Integer maxCorrectAnswers = 1;

    @Builder.Default
    private Integer correctAnswerCount = 0;

    private LocalDateTime problemStartTime;
    private Integer problemDuration;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<RoomPlayer> players = new ArrayList<>();

    @Builder.Default
    private Integer minPlayersToStart = 1;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Submission> submissions = new ArrayList<>();

    public boolean isProblemActive() {
        if (problemStartTime == null || problemDuration == null) {
            return false;
        }
        LocalDateTime end = problemStartTime.plusSeconds(problemDuration);
        return LocalDateTime.now().isBefore(end);
    }
}
