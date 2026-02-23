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
import com.example.codebreaker.services.BadgeService;
import com.example.codebreaker.services.ScoringService;
import com.example.codebreaker.services.SubmissionService;
import com.example.codebreaker.util.DockerExecutor;
import com.example.codebreaker.websockets.RoomSocketController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    private final ProblemRepository problemRepo;
    private final RoomPlayerRepository roomPlayerRepo;
    private final SubmissionRepository submissionRepo;
    private final ScoringService scoringService;
    private final RoomSocketController roomSocketController;
    private final BadgeService badgeService;
    private final int speedsterSeconds;

    public SubmissionServiceImpl(
            ProblemRepository problemRepo,
            RoomPlayerRepository roomPlayerRepo,
            SubmissionRepository submissionRepo,
            ScoringService scoringService,
            RoomSocketController roomSocketController,
            BadgeService badgeService,
            @Value("${rooms.badges.speedsterSeconds:120}") int speedsterSeconds
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

        roomSocketController.submissionReceived(
                room.getId(),
                request.getPlayerId(),
                roomPlayer.getPlayer().getUsername()
        );

        List<TestCaseResult> results = new ArrayList<>();
        boolean allPassed = true;
        
        List<String> inputs = problem.getTestCases().stream()
                .map(com.example.codebreaker.model.TestCase::getInput)
                .toList();

        DockerExecutor.BatchExecutionResult batchRes = 
                DockerExecutor.executeBatch(request.getLanguage(), request.getCode(), inputs);

        if (!batchRes.success) {
            allPassed = false;
            
            for (var tc : problem.getTestCases()) {
                if (!tc.isHidden()) {
                    results.add(TestCaseResult.builder()
                            .testCaseId(tc.getId())
                            .passed(false)
                            .error(batchRes.errorMessage)
                            .input(tc.getInput())
                            .expectedOutput(tc.getOutput())
                            .actualOutput("")
                            .build());
                }
            }
        } else {
            for (int i = 0; i < problem.getTestCases().size(); i++) {
                var tc = problem.getTestCases().get(i);
                String actualOutput = i < batchRes.outputs.size() ? batchRes.outputs.get(i) : "";
                
                boolean passed = actualOutput.trim().equals(tc.getOutput().trim());

                if (!tc.isHidden()) {
                    results.add(TestCaseResult.builder()
                            .testCaseId(tc.getId())
                            .passed(passed)
                            .input(tc.getInput())
                            .expectedOutput(tc.getOutput())
                            .actualOutput(actualOutput)
                            .build());
                }

                if (!passed) {
                    allPassed = false;
                }
            }
        }

        Instant now = Instant.now();

        Submission submission = Submission.builder()
                .room(room)
                .player(roomPlayer)
                .problem(problem)
                .code(request.getCode())
                .language(request.getLanguage())
                .passed(allPassed)
                .submittedAt(now)
                .build();

        submissionRepo.save(submission);

        int scoreGained = 0;

        if (allPassed) {

            int prevCorrect = room.getCorrectAnswerCount();
            scoreGained = scoringService.applyScore(submission);

            roomPlayer.setHasAnsweredCorrectly(true);
            roomPlayer.setCorrectAnswerTimestamp(now);

            
            var player = roomPlayer.getPlayer();
            player.setTotalCorrectSubmissions(
                    (player.getTotalCorrectSubmissions() == null ? 0 : player.getTotalCorrectSubmissions()) + 1
            );
            player.setTotalSubmissions(
                    (player.getTotalSubmissions() == null ? 0 : player.getTotalSubmissions()) + 1
            );
            player.setTotalProblemsSolved(
                    (player.getTotalProblemsSolved() == null ? 0 : player.getTotalProblemsSolved()) + 1
            );

            roomPlayerRepo.save(roomPlayer);

            roomSocketController.scoreUpdated(
                    room.getId(),
                    request.getPlayerId(),
                    player.getUsername(),
                    roomPlayer.getScore(),
                    true
            );

            
            if (prevCorrect == 0 && !room.isPrivateRoom()) {
                badgeService.awardBadge(
                        player,
                        "FIRST_BLOOD",
                        "First Blood",
                        "First correct submission in the room",
                        com.example.codebreaker.model.BadgeCategory.ROOM_PERFORMANCE
                );
            }

            
            long elapsedSeconds = 0;
            Instant problemStart = room.getProblemStartTime();
            if (problemStart != null) {
                elapsedSeconds = Duration.between(problemStart, now).getSeconds();
            }

            if (!room.isPrivateRoom() && elapsedSeconds <= speedsterSeconds) {
                badgeService.awardBadge(
                        player,
                        "SPEEDSTER",
                        "Speedster",
                        "Solved a problem under " + speedsterSeconds + " seconds",
                        com.example.codebreaker.model.BadgeCategory.SPEED_ACCURACY
                );
            }

            
            if (!room.isPrivateRoom()) {

                if (player.getTotalProblemsSolved() == 10) {
                    badgeService.awardBadge(
                            player,
                            "SOLVER_10",
                            "Solver — 10",
                            "Solve 10 problems",
                            com.example.codebreaker.model.BadgeCategory.SKILL
                    );
                }

                if (player.getTotalProblemsSolved() == 50) {
                    badgeService.awardBadge(
                            player,
                            "SOLVER_50",
                            "Solver — 50",
                            "Solve 50 problems",
                            com.example.codebreaker.model.BadgeCategory.SKILL
                    );
                }

                if (player.getTotalSubmissions() >= 10) {
                    double accuracy =
                            (double) player.getTotalCorrectSubmissions() /
                            player.getTotalSubmissions();

                    if (accuracy >= 0.9) {
                        badgeService.awardBadge(
                                player,
                                "ACCURACY_90",
                                "Accuracy 90%",
                                "Maintain >= 90% pass rate",
                                com.example.codebreaker.model.BadgeCategory.SPEED_ACCURACY
                        );
                    }
                }
            }

        } else {
            
            var player = roomPlayer.getPlayer();
            player.setTotalSubmissions(
                    (player.getTotalSubmissions() == null ? 0 : player.getTotalSubmissions()) + 1
            );
            roomPlayerRepo.save(roomPlayer);
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

        roomSocketController.submissionResult(
                room.getId(),
                result,
                roomPlayer.getPlayer().getUsername()
        );

        return result;
    }
}
