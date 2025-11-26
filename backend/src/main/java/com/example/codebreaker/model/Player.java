package com.example.codebreaker.model;

import jakarta.persistence.*;
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

    private String password; // for now plain, later encrypt

    private int score;

    @Enumerated(EnumType.STRING)
    private Role role; // ADMIN or MEMBER

    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}

