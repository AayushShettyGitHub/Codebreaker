package com.example.codebreaker.services.impl;

import com.example.codebreaker.Dto.SubmissionRequest;
import com.example.codebreaker.Dto.SubmissionResult;
import com.example.codebreaker.Dto.TestCaseResult;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.model.Submission;
import com.example.codebreaker.repo.ProblemRepository;
import com.example.codebreaker.repo.RoomPlayerRepository;
import com.example.codebreaker.repo.SubmissionRepository;
import com.example.codebreaker.services.ScoringService;
import com.example.codebreaker.services.SubmissionService;
import com.example.codebreaker.util.DockerExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    private final ProblemRepository problemRepo;
    private final RoomPlayerRepository roomPlayerRepo;
    private final SubmissionRepository submissionRepo;
    private final ScoringService scoringService;

    public SubmissionServiceImpl(
            ProblemRepository problemRepo,
            RoomPlayerRepository roomPlayerRepo,
            SubmissionRepository submissionRepo,
            ScoringService scoringService
    ) {
        this.problemRepo = problemRepo;
        this.roomPlayerRepo = roomPlayerRepo;
        this.submissionRepo = submissionRepo;
        this.scoringService = scoringService;
    }

    @Override
    @Transactional
    public SubmissionResult submitCode(SubmissionRequest request) {

        Problem problem = problemRepo.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        RoomPlayer roomPlayer = roomPlayerRepo
                .findByRoomIdAndPlayerId(request.getRoomId(), request.getPlayerId())
                .orElseThrow(() -> new RuntimeException("Player not in room"));

        Room room = roomPlayer.getRoom();

        if (!room.isProblemActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Submission window has closed"
            );
        }

        if (roomPlayer.isHasAnsweredCorrectly()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You have already solved this problem"
            );
        }

        if (room.getCorrectAnswerCount() >= room.getMaxCorrectAnswers()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Maximum correct answers reached for this problem"
            );
        }

        if (problem.getTestCases() == null || problem.getTestCases().isEmpty()) {
            throw new RuntimeException("Problem has no test cases");
        }

        List<TestCaseResult> results = new ArrayList<>();
        boolean allPassed = true;

        for (var tc : problem.getTestCases()) {

            DockerExecutor.ExecutionResult exec =
                    DockerExecutor.execute(
                            request.getLanguage(),
                            request.getCode(),
                            tc.getInput()
                    );

            boolean passed = exec.success &&
                    exec.output.trim().equals(tc.getOutput().trim());

            results.add(TestCaseResult.builder()
                    .testCaseId(tc.getId())
                    .passed(passed)
                    .error(exec.success ? null : exec.error)
                    .build());

            if (!passed) allPassed = false;
        }

        Submission submission = Submission.builder()
                .room(room)
                .player(roomPlayer)
                .problem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .passed(allPassed)
                .build();

        submissionRepo.save(submission);

        int scoreGained = 0;

        if (allPassed) {
            scoreGained = scoringService.applyScore(submission);

            roomPlayer.setHasAnsweredCorrectly(true);
            roomPlayer.setCorrectAnswerTimestamp(System.currentTimeMillis());
        }

        return SubmissionResult.builder()
                .problemId(problem.getId())
                .playerId(request.getPlayerId())
                .results(results)
                .allPassed(allPassed)
                .score(scoreGained)
                .build();
    }
}
