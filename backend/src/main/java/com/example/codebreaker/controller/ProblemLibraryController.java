package com.example.codebreaker.controller;

import com.example.codebreaker.Dto.MessageResponse;
import com.example.codebreaker.model.ProblemLibrary;
import com.example.codebreaker.repo.ProblemLibraryRepository;
import com.example.codebreaker.services.ProblemLibraryService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/problem-library")
public class ProblemLibraryController {

    private final ProblemLibraryRepository repository;
    private final ProblemLibraryService libraryService;

    public ProblemLibraryController(ProblemLibraryRepository repository, ProblemLibraryService libraryService) {
        this.repository = repository;
        this.libraryService = libraryService;
    }

    @Transactional(readOnly = true)
    @GetMapping
    public List<com.example.codebreaker.Dto.ProblemLibraryResponse> getAll() {
        return repository.findAll().stream()
                .map(com.example.codebreaker.Dto.ProblemLibraryResponse::fromEntity)
                .toList();
    }

    @PostMapping("/seed")
    public ResponseEntity<?> seed() {
        libraryService.seedLibrary(true);
        return ResponseEntity.ok(MessageResponse.builder().message("Library seeded successfully").build());
    }
}
