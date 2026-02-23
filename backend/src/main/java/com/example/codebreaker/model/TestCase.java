package com.example.codebreaker.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 2000)
    private String input;

    @Column(length = 2000)
    private String output;

    @Builder.Default
    private boolean hidden = false;

    @ManyToOne
    @JoinColumn(name = "problem_id")
    @JsonIgnore
    private Problem problem;
}
