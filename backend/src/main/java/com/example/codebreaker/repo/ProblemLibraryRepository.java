package com.example.codebreaker.repo;

import com.example.codebreaker.model.ProblemLibrary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemLibraryRepository extends JpaRepository<ProblemLibrary, Long> {
}
