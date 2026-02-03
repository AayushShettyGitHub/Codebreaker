package com.example.codebreaker.controller;

import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.repo.RoomRepository;
import com.example.codebreaker.services.ProblemService;
import com.example.codebreaker.Dto.ProblemWithTestCasesRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;
    private final RoomRepository roomRepo;

    public ProblemController(ProblemService problemService, RoomRepository roomRepo) {
        this.problemService = problemService;
        this.roomRepo = roomRepo;
    }

    @PostMapping("/{roomId}/with-test-cases")
    public Problem createWithTestCases(
            @PathVariable Long roomId,
            @RequestBody ProblemWithTestCasesRequest request) {
        return problemService.createWithTestCases(roomId, request);
    }

    @GetMapping("/{id}")
    public Problem getProblem(@PathVariable Long id) {
        return problemService.getById(id);
    }

    @PostMapping("/rooms/{roomId}/start-problem")
    public ResponseEntity<?> startProblem(
            @PathVariable Long roomId,
            @RequestBody Map<String, Integer> body) {

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Integer duration = body.get("duration");

        if (!room.isPrivateRoom()) {
            int currentPlayers = room.getPlayers() == null ? 0 : room.getPlayers().size();
            int minNeeded = room.getMinPlayersToStart() == null ? 1 : room.getMinPlayersToStart();
            if (currentPlayers < minNeeded) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Not enough players to start public room. Minimum required: " + minNeeded
                ));
            }
        }

        room.setProblemStartTime(LocalDateTime.now());
        room.setProblemDuration(duration);
        roomRepo.save(room);

        return ResponseEntity.ok(Map.of(
                "message", "Problem started",
                "duration", duration
        ));
    }
}
