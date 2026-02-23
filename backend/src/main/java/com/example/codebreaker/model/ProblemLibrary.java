package com.example.codebreaker.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String title;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(columnDefinition = "TEXT")
    private String description;


    private String difficulty;

    @ElementCollection
    @CollectionTable(name = "problem_library_tags", joinColumns = @JoinColumn(name = "problem_library_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @OneToMany(
        mappedBy = "problemLibrary",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    private List<LibraryTestCase> testCases = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "problemLibraryHidden", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LibraryTestCase> hiddenTestCases = new ArrayList<>();

    @Builder.Default
    private Long createdAt = System.currentTimeMillis();
}
