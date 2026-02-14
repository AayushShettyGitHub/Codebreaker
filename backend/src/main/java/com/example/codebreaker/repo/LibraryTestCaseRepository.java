package com.example.codebreaker.repo;

import com.example.codebreaker.model.LibraryTestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryTestCaseRepository extends JpaRepository<LibraryTestCase, Long> {
}
