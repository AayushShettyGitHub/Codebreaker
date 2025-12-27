package com.example.codebreaker.controller;

import com.example.codebreaker.Dto.SubmissionRequest;
import com.example.codebreaker.Dto.SubmissionResult;
import com.example.codebreaker.services.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    @Autowired
    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody SubmissionRequest request) {
        try {
            SubmissionResult result = submissionService.submitCode(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException ex) {
            ex.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("error", ex.getMessage())
            );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Internal server error: " + ex.getMessage())
            );
        }
    }
}

