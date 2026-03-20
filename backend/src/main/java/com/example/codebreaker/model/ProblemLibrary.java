package com.example.codebreaker.model;

import org.hibernate.annotations.BatchSize;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@ToString(exclude = {"tags", "testCases", "hiddenTestCases"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
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
    @BatchSize(size = 50)
    private Set<String> tags = new HashSet<>();

    @OneToMany(
        mappedBy = "problemLibrary",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @Builder.Default
    @BatchSize(size = 50)
    private Set<LibraryTestCase> testCases = new HashSet<>();

    @JsonIgnore
    @OneToMany(mappedBy = "problemLibraryHidden", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @BatchSize(size = 50)
    private Set<LibraryTestCase> hiddenTestCases = new HashSet<>();

    @Builder.Default
    private Long createdAt = System.currentTimeMillis();
}
