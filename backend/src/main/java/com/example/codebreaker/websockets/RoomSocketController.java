package com.example.codebreaker.websockets;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class RoomSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    private String roomTopic(Long roomId) {
        return "/topic/room/" + roomId;
    }

    public void roomCreated(Room room) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "ROOM_CREATED");
        payload.put("room", room);

        messagingTemplate.convertAndSend("/topic/rooms", payload);
    }

    public void roomDeleted(Long roomId) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "ROOM_DELETED");
        payload.put("roomId", roomId);

        messagingTemplate.convertAndSend("/topic/rooms", payload);
        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void playerJoined(Long roomId, Player player) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PLAYER_JOINED");
        payload.put("player", player);

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void playerLeft(Long roomId, Player player) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PLAYER_LEFT");
        payload.put("player", player);

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void problemSet(Long roomId, Problem problem) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "PROBLEM_SET");
        payload.put("problem", problem);

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }

    public void maxCorrectSet(Long roomId, Integer maxCorrectAnswers) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "MAX_CORRECT_SET");
        payload.put("maxCorrectAnswers", maxCorrectAnswers);

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
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

    public void answerCorrect(Long roomId, Player player, int scoreGained) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "SCORE_UPDATE");

        Map<String, Object> playerData = new HashMap<>();
        playerData.put("id", player.getId());
        playerData.put("username", player.getUsername());
        playerData.put("score", scoreGained);

        payload.put("player", playerData);

        messagingTemplate.convertAndSend(roomTopic(roomId), payload);
    }
}
