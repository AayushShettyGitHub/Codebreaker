package com.example.codebreaker.services.impl;

import com.example.codebreaker.Dto.SubmissionRequest;
import com.example.codebreaker.Dto.SubmissionResult;
import com.example.codebreaker.Dto.TestCaseResult;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.TestCase;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.repo.ProblemRepository;
import com.example.codebreaker.services.PlayerService;
import com.example.codebreaker.repo.RoomPlayerRepository;
import com.example.codebreaker.services.SubmissionService;
import com.example.codebreaker.util.DockerExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    private final ProblemRepository problemRepo;
    private final PlayerService playerService;
    private final RoomPlayerRepository roomPlayerRepo;

    public SubmissionServiceImpl(ProblemRepository problemRepo, PlayerService playerService, RoomPlayerRepository roomPlayerRepo) {
        this.problemRepo = problemRepo;
        this.playerService = playerService;
        this.roomPlayerRepo = roomPlayerRepo;
    }

    @Override
    @Transactional
    public SubmissionResult submitCode(SubmissionRequest request) {
        // Fetch problem and player
        Problem problem = problemRepo.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        // Verify player is in the room
        RoomPlayer roomPlayer = roomPlayerRepo.findByRoomIdAndPlayerId(request.getRoomId(), request.getPlayerId())
                .orElseThrow(() -> new RuntimeException("Player not in room"));

        // Check if problem has test cases
        if (problem.getTestCases() == null || problem.getTestCases().isEmpty()) {
            throw new RuntimeException("Problem has no test cases");
        }

        // Execute code against all test cases
        List<TestCaseResult> results = new ArrayList<>();
        boolean allPassed = true;

        for (TestCase tc : problem.getTestCases()) {
            DockerExecutor.ExecutionResult execResult = DockerExecutor.execute(
                    request.getLanguage(),
                    request.getCode(),
                    tc.getInput()
            );

            boolean passed = false;
            String error = null;

            if (execResult.success) {
                // Compare output (trim whitespace)
                String expectedOutput = tc.getOutput().trim();
                String actualOutput = execResult.output.trim();
                passed = expectedOutput.equals(actualOutput);

                if (!passed) {
                    error = "Output mismatch. Expected: " + expectedOutput + ", Got: " + actualOutput;
                }
            } else {
                error = execResult.error;
                passed = false;
            }

            results.add(TestCaseResult.builder()
                    .testCaseId(tc.getId())
                    .passed(passed)
                    .error(error)
                    .build());

            if (!passed) {
                allPassed = false;
            }
        }

        // Update score if all passed
        int scoreGain = 0;
        if (allPassed) {
            scoreGain = 50; // base score for passing all test cases
            roomPlayer.setScore(roomPlayer.getScore() + scoreGain);
            roomPlayer.setHasAnsweredCorrectly(true);
            roomPlayer.setCorrectAnswerTimestamp(System.currentTimeMillis());
            roomPlayerRepo.save(roomPlayer);
        }

        return SubmissionResult.builder()
                .problemId(request.getProblemId())
                .playerId(request.getPlayerId())
                .results(results)
                .allPassed(allPassed)
                .score(allPassed ? scoreGain : 0)
                .build();
    }
}
