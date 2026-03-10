package com.example.codebreaker.controller;

import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.repo.RoomRepository;
import com.example.codebreaker.services.ProblemService;
import com.example.codebreaker.websockets.RoomSocketController;
import com.example.codebreaker.Dto.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemService;
    private final RoomRepository roomRepo;
    private final RoomSocketController roomSocketController;

    public ProblemController(ProblemService problemService, RoomRepository roomRepo, RoomSocketController roomSocketController) {
        this.problemService = problemService;
        this.roomRepo = roomRepo;
        this.roomSocketController = roomSocketController;
    }

    @PostMapping("/{roomId}/with-test-cases")
    public com.example.codebreaker.Dto.ProblemResponse createWithTestCases(
            @PathVariable Long roomId,
            @RequestBody ProblemWithTestCasesRequest request) {
        return com.example.codebreaker.Dto.ProblemResponse.fromEntity(problemService.createWithTestCases(roomId, request));
    }

    @GetMapping("/{id}")
    public com.example.codebreaker.Dto.ProblemResponse getProblem(@PathVariable Long id) {
        return com.example.codebreaker.Dto.ProblemResponse.fromEntity(problemService.getById(id));
    }

    @PostMapping("/rooms/{roomId}/start-problem")
    public ResponseEntity<?> startProblem(
            @PathVariable Long roomId,
            @RequestBody StartProblemRequest body) {

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Integer duration = body.getDuration();
        
        if (duration == null || duration < 10) {
            return ResponseEntity.badRequest().body(MessageResponse.builder()
                    .error("Duration is required and must be at least 10 seconds")
                    .build());
        }
        
        if (room.getCurrentProblem() == null) {
            return ResponseEntity.badRequest().body(MessageResponse.builder()
                    .error("No problem set for this room. Set a problem first before starting.")
                    .build());
        }

        if (!room.isPrivateRoom()) {
            int currentPlayers = room.getPlayers() == null ? 0 : room.getPlayers().size();
            int minNeeded = room.getMinPlayersToStart() == null ? 1 : room.getMinPlayersToStart();
            if (currentPlayers < minNeeded) {
                return ResponseEntity.badRequest().body(MessageResponse.builder()
                        .error("Not enough players to start public room. Minimum required: " + minNeeded)
                        .build());
            }
        }

        room.setProblemStartTime(Instant.now());
        room.setProblemDuration(duration);
        roomRepo.save(room);

        roomSocketController.problemStarted(roomId, room.getCurrentProblem(), System.currentTimeMillis(), duration);

        return ResponseEntity.ok(ProblemStartResponse.builder()
                .message("Problem started")
                .duration(duration)
                .problemStartTime(room.getProblemStartTime())
                .problemDuration(room.getProblemDuration())
                .build());
    }
}
