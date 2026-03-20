package com.example.codebreaker.repo;

import com.example.codebreaker.model.ProblemLibrary;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemLibraryRepository extends JpaRepository<ProblemLibrary, Long> {

    List<ProblemLibrary> findAll();

    @Query("SELECT COUNT(tc) FROM LibraryTestCase tc WHERE tc.problemLibraryHidden IS NOT NULL")
    long countHiddenTests();

    Optional<ProblemLibrary> findByTitle(String title);

    @Query("SELECT p FROM ProblemLibrary p LEFT JOIN FETCH p.hiddenTestCases WHERE p.title = :title")
    Optional<ProblemLibrary> findByTitleWithHidden(String title);
}
