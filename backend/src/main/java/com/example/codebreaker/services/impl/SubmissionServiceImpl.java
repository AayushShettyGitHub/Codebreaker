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
import com.example.codebreaker.websockets.RoomSocketController;
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
    private final RoomSocketController roomSocketController;
    private final com.example.codebreaker.services.BadgeService badgeService;
    private int speedsterSeconds = 120;

    public SubmissionServiceImpl(
            ProblemRepository problemRepo,
            RoomPlayerRepository roomPlayerRepo,
            SubmissionRepository submissionRepo,
            ScoringService scoringService,
            RoomSocketController roomSocketController,
            com.example.codebreaker.services.BadgeService badgeService,
            @org.springframework.beans.factory.annotation.Value("${rooms.badges.speedsterSeconds:120}") int speedsterSeconds
    ) {
        this.problemRepo = problemRepo;
        this.roomPlayerRepo = roomPlayerRepo;
        this.submissionRepo = submissionRepo;
        this.scoringService = scoringService;
        this.roomSocketController = roomSocketController;
        this.badgeService = badgeService;
        this.speedsterSeconds = speedsterSeconds;
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

        roomSocketController.submissionReceived(room.getId(), request.getPlayerId(), roomPlayer.getPlayer().getUsername());

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
                    .input(tc.getInput())
                    .expectedOutput(tc.getOutput())
                    .actualOutput(exec.success ? exec.output : "")
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
            int prevCorrect = room.getCorrectAnswerCount();
            scoreGained = scoringService.applyScore(submission);

            roomPlayer.setHasAnsweredCorrectly(true);
            roomPlayer.setCorrectAnswerTimestamp(System.currentTimeMillis());
            roomPlayerRepo.save(roomPlayer);
            
            roomSocketController.scoreUpdated(
                    room.getId(),
                    request.getPlayerId(),
                    roomPlayer.getPlayer().getUsername(),
                    roomPlayer.getScore(),
                    true
            );

            if (prevCorrect == 0 && !room.isPrivateRoom()) {
                badgeService.awardBadge(
                        roomPlayer.getPlayer(),
                        "FIRST_BLOOD",
                        "First Blood",
                        "First correct submission in the room",
                        com.example.codebreaker.model.BadgeCategory.ROOM_PERFORMANCE
                );
            }

            java.time.Duration dur = java.time.Duration.between(room.getProblemStartTime(), submission.getSubmittedAt());
            long seconds = dur.getSeconds();
            if (!room.isPrivateRoom() && seconds <= speedsterSeconds) {
                badgeService.awardBadge(
                        roomPlayer.getPlayer(),
                        "SPEEDSTER",
                        "Speedster",
                        "Solved a problem under " + speedsterSeconds + " seconds",
                        com.example.codebreaker.model.BadgeCategory.SPEED_ACCURACY
                );
            }
        }

        SubmissionResult result = SubmissionResult.builder()
                .problemId(problem.getId())
                .playerId(request.getPlayerId())
                .results(results)
                .allPassed(allPassed)
                .score(scoreGained)
                .maxCorrectAnswers(room.getMaxCorrectAnswers())
                .correctAnswerCount(room.getCorrectAnswerCount())
                .build();

        roomSocketController.submissionResult(room.getId(), result, roomPlayer.getPlayer().getUsername());

        return result;
    }
}
