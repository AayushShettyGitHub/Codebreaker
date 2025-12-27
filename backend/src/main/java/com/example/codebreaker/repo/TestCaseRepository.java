package com.example.codebreaker.repo;

import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProblem(Problem problem);
}
