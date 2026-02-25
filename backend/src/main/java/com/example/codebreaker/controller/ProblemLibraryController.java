package com.example.codebreaker.controller;

import com.example.codebreaker.model.ProblemLibrary;
import com.example.codebreaker.repo.ProblemLibraryRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/problem-library")
public class ProblemLibraryController {

    private final ProblemLibraryRepository repository;

    public ProblemLibraryController(ProblemLibraryRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public List<com.example.codebreaker.Dto.ProblemLibraryResponse> getAll() {
        return repository.findAll().stream()
                .map(com.example.codebreaker.Dto.ProblemLibraryResponse::fromEntity)
                .toList();
    }
}
