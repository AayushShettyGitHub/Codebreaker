package com.example.codebreaker.websockets;

import com.example.codebreaker.Dto.SubmissionResult;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.Submission;
import com.example.codebreaker.repo.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class RoomSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final SubmissionRepository submissionRepository;

    private String roomTopic(Long roomId) {
        return "/topic/room/" + roomId;
    }

    private String roomsTopic() {
        return "/topic/rooms";
    }

    public void roomCreated(Room room) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "ROOM_CREATED");
        payload.put("room", room);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomsTopic(), payload);
    }

    public void roomDeleted(Long roomId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "ROOM_DELETED");
        payload.put("roomId", roomId);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomsTopic(), payload);
        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void roomUpdated(Room room) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "ROOM_UPDATED");
        payload.put("room", room);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(room.getId()), payload);
    }

    public void playerJoined(Long roomId, Player player) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PLAYER_JOINED");
        payload.put("player", player);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void playerLeft(Long roomId, Player player) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PLAYER_LEFT");
        payload.put("player", player);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void playersUpdated(Long roomId, java.util.List<?> players) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PLAYERS_UPDATED");
        payload.put("players", players);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void problemSet(Long roomId, Problem problem) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PROBLEM_SET");
        payload.put("problem", problem);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void problemStarted(Long roomId, Problem problem, Long startTime, Integer durationSeconds) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PROBLEM_STARTED");
        payload.put("problem", problem);
        payload.put("startTime", startTime);
        payload.put("durationSeconds", durationSeconds);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void problemEnded(Long roomId, Long problemId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PROBLEM_ENDED");
        payload.put("problemId", problemId);
        payload.put("timestamp", LocalDateTime.now());
        // fetch top successful submissions for this problem and include them as part of the reveal
        try {
            java.util.List<Submission> sols = submissionRepository.findByProblemIdAndPassedTrueOrderBySubmittedAtAsc(problemId, PageRequest.of(0, 5));
            java.util.List<java.util.Map<String, Object>> mapped = sols.stream().map(s -> {
                java.util.Map<String, Object> m = new java.util.HashMap<>();
                m.put("id", s.getId());
                m.put("playerUsername", s.getPlayer() != null && s.getPlayer().getPlayer() != null ? s.getPlayer().getPlayer().getUsername() : null);
                m.put("code", s.getCode());
                m.put("language", s.getLanguage());
                m.put("submittedAt", s.getSubmittedAt() != null ? s.getSubmittedAt().toString() : null);
                m.put("passed", s.isPassed());
                m.put("problemId", s.getProblem() != null ? s.getProblem().getId() : null);
                return m;
            }).collect(Collectors.toList());
            payload.put("solutions", mapped);
        } catch (Exception e) {
            // swallow errors here to avoid disrupting the event; frontend will still receive PROBLEM_ENDED
            System.err.println("Failed to fetch solutions for reveal: " + e.getMessage());
        }

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void maxCorrectSet(Long roomId, Integer maxCorrectAnswers) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "MAX_CORRECT_SET");
        payload.put("maxCorrectAnswers", maxCorrectAnswers);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void submissionReceived(Long roomId, Long playerId, String playerUsername) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "SUBMISSION_RECEIVED");
        payload.put("playerId", playerId);
        payload.put("playerUsername", playerUsername);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void submissionResult(Long roomId, SubmissionResult result, String playerUsername) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "SUBMISSION_RESULT");
        payload.put("result", result);
        payload.put("playerUsername", playerUsername);
        payload.put("reveal", false);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void scoreUpdated(Long roomId, Long playerId, String playerUsername, int score, boolean correct) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "SCORE_UPDATE");
        payload.put("playerId", playerId);
        payload.put("playerUsername", playerUsername);
        payload.put("score", score);
        payload.put("correct", correct);
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void playerKicked(Long roomId, Player player) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PLAYER_KICKED");
        payload.put("playerId", player.getId());
        payload.put("playerUsername", player.getUsername());
        payload.put("timestamp", LocalDateTime.now());

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void answerCorrect(Long roomId, Player player, int scoreGained) {
        scoreUpdated(roomId, player.getId(), player.getUsername(), scoreGained, true);
    }

    @MessageMapping("/room/{roomId}/problemSet")
    public void handleProblemSet(@DestinationVariable Long roomId, Problem problem) {
        problemSet(roomId, problem);
    }

    @MessageMapping("/room/{roomId}/maxCorrectSet")
    public void handleMaxCorrectSet(@DestinationVariable Long roomId, Map<String, Integer> data) {
        int maxCorrectAnswers = data.getOrDefault("maxCorrectAnswers", 1);
        maxCorrectSet(roomId, maxCorrectAnswers);
    }

    @MessageMapping("/room/{roomId}/problemStart")
    public void handleProblemStart(
            @DestinationVariable Long roomId,
            Map<String, Object> data
    ) {
        Long problemId = ((Number) data.get("problemId")).longValue();
        Integer durationSeconds = ((Number) data.get("durationSeconds")).intValue();
        
        Map<String, Object> problemData = new HashMap<>();
        problemData.put("id", problemId);
        
        Problem problem = new Problem();
        problem.setId(problemId);
        
        problemStarted(roomId, problem, System.currentTimeMillis(), durationSeconds);
    }

    @MessageMapping("/room/{roomId}/problemEnd")
    public void handleProblemEnd(
            @DestinationVariable Long roomId,
            Map<String, Object> data
    ) {
        Long problemId = ((Number) data.get("problemId")).longValue();
        problemEnded(roomId, problemId);
    }
}
