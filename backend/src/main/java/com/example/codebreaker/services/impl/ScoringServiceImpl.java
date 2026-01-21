package com.example.codebreaker.services.impl;

import com.example.codebreaker.model.Submission;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.services.ScoringService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class ScoringServiceImpl implements ScoringService {

    private static final int BASE_SCORE = 100;
    private static final int WRONG_PENALTY = -10;
    private static final int FIRST_SOLVE_BONUS = 20;

    @Override
    public int applyScore(Submission submission) {

        Room room = submission.getRoom();
        RoomPlayer player = submission.getPlayer();

      
        if (!submission.isPassed()) {
            player.setScore(player.getScore() + WRONG_PENALTY);
            return WRONG_PENALTY;
        }

        
        int bonus = calculateFirstSolveBonus(
                room.getProblemStartTime(),
                submission.getSubmittedAt()
        );

        int gainedScore = BASE_SCORE + bonus;

        player.setScore(player.getScore() + gainedScore);
        player.setLastCorrectSubmissionTime(submission.getSubmittedAt());

        room.setCorrectAnswerCount(room.getCorrectAnswerCount() + 1);

        return gainedScore;
    }

    private int calculateFirstSolveBonus(
            LocalDateTime problemStart,
            LocalDateTime submittedAt
    ) {
        long minutesElapsed =
                Duration.between(problemStart, submittedAt).toMinutes();

        return Math.max(0, FIRST_SOLVE_BONUS - (int) minutesElapsed);
    }
}
    
