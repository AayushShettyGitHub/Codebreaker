package com.example.codebreaker.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private String answer;

    private String difficulty;

    @OneToOne
    @JoinColumn(
        name = "room_id",
        nullable = false,
        unique = true
    )
    @JsonIgnore
    private Room room;

    @OneToMany(
        mappedBy = "problem",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<TestCase> testCases = new ArrayList<>();

    @Builder.Default
    private Long createdAt = System.currentTimeMillis();
}
