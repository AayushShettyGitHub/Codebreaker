package com.example.codebreaker.controller;

import com.example.codebreaker.model.Problem;
import com.example.codebreaker.services.ProblemService;
import com.example.codebreaker.Dto.ProblemWithTestCasesRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService service;

    public ProblemController(ProblemService service) {
        this.service = service;
    }

    @PostMapping("/{roomId}/with-test-cases")
    public Problem createWithTestCases(
            @PathVariable Long roomId,
            @RequestBody ProblemWithTestCasesRequest request) {
        return service.createWithTestCases(roomId, request);
    }

    // New endpoint to fetch problem with test cases
    @GetMapping("/{id}")
    public Problem getProblem(@PathVariable Long id) {
        return service.getById(id);
    }
}

