package com.example.codebreaker.controller;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.services.RoomService;
import com.example.codebreaker.services.PlayerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final PlayerService playerService;

    public RoomController(RoomService roomService, PlayerService playerService) {
        this.roomService = roomService;
        this.playerService = playerService;
    }
    
    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        return roomService.createRoom(room);
    }

    // List all rooms
    @GetMapping
    public List<Room> listRooms() {
        return roomService.listRooms();
    }

    @PostMapping("/{roomId}/join")
    public Player joinRoom(@PathVariable Long roomId, @RequestBody Player player) {
        return roomService.joinRoom(roomId, player);
    }

    @PostMapping("/{roomId}/problem")
    public Room setProblem(@PathVariable Long roomId, @RequestBody Problem problem) {
        return roomService.setProblem(roomId, problem);
    }

    @PostMapping("/{roomId}/submit")
    public String submitAnswer(@PathVariable Long roomId, @RequestBody Map<String, String> payload) {
        String playerName = payload.get("player");
        String answer = payload.get("answer");

        Room room = roomService.getRoom(roomId);
        Player player = playerService.getByUsernameAndRoom(playerName, room);

        if (room.getCurrentProblem() != null && room.getCurrentProblem().getAnswer().equals(answer)) {
            player.setScore(player.getScore() + 1);
            playerService.save(player);
            return "Correct!";
        } else {
            return "Wrong!";
        }
    }
}
