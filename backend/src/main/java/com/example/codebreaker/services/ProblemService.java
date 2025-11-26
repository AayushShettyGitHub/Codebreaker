package com.example.codebreaker.services;

import com.example.codebreaker.model.Problem;
import com.example.codebreaker.repo.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProblemService {

    private final ProblemRepository repo;

    public ProblemService(ProblemRepository repo) {
        this.repo = repo;
    }

    public Problem create(Problem problem) {
        return repo.save(problem);
    }

    public List<Problem> getAll() {
        return repo.findAll();
    }
}
