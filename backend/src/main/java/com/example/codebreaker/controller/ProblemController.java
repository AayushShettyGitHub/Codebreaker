package com.example.codebreaker.controller;

import com.example.codebreaker.model.Problem;
import com.example.codebreaker.services.ProblemService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService service;

    public ProblemController(ProblemService service) {
        this.service = service;
    }

    @PostMapping
    public Problem create(@RequestBody Problem problem) {
        return service.create(problem);
    }

    @GetMapping
    public List<Problem> getAll() {
        return service.getAll();
    }
}
