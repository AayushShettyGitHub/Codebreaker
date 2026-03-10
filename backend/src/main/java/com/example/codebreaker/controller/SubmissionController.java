package com.example.codebreaker.controller;

import com.example.codebreaker.Dto.MessageResponse;
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

import org.springframework.data.redis.core.RedisTemplate;

import java.time.Duration;
import java.util.Map;


@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public SubmissionController(SubmissionService submissionService, RedisTemplate<String, Object> redisTemplate) {
        this.submissionService = submissionService;
        this.redisTemplate = redisTemplate;
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody SubmissionRequest request) {
        String rateLimitKey = "rate_limit:submit:" + request.getPlayerId();
        Boolean alreadySubmitted = redisTemplate.hasKey(rateLimitKey);

        if (Boolean.TRUE.equals(alreadySubmitted)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                    MessageResponse.builder().error("Please wait 5 seconds between submissions").build()
            );
        }

        redisTemplate.opsForValue().set(rateLimitKey, "1", Duration.ofSeconds(5));

        try {
            SubmissionResult result = submissionService.submitCode(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException ex) {
            ex.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    MessageResponse.builder().error(ex.getMessage()).build()
            );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    MessageResponse.builder().error("Internal server error: " + ex.getMessage()).build()
            );
        }
    }
}

