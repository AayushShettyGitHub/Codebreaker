package com.example.codebreaker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Problem {
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private String answer;

    private String difficulty;
}

