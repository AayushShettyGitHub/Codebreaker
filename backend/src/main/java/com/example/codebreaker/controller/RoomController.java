package com.example.codebreaker.controller;

import com.example.codebreaker.Dto.CreateRoomRequest;
import com.example.codebreaker.Dto.LeaderboardEntry;
import com.example.codebreaker.Dto.PublicRoomResponse;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.Submission;
import com.example.codebreaker.repo.SubmissionRepository;
import com.example.codebreaker.services.RoomService;
import com.example.codebreaker.services.PlayerService;
import jakarta.validation.Valid;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;
    private final PlayerService playerService;
    private final SubmissionRepository submissionRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    public RoomController(RoomService roomService, PlayerService playerService, SubmissionRepository submissionRepository, RedisTemplate<String, Object> redisTemplate) {
        this.roomService = roomService;
        this.playerService = playerService;
        this.submissionRepository = submissionRepository;
        this.redisTemplate = redisTemplate;
    }

    @PostMapping
    public com.example.codebreaker.Dto.RoomResponse createRoom(@Valid @RequestBody CreateRoomRequest request) {
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(roomService.createRoom(request.getPlayerId(), request.getName(), request.getPrivateRoom()));
    }

    @GetMapping
    public List<com.example.codebreaker.Dto.RoomResponse> listRooms() {
        return roomService.listRooms().stream()
                .map(com.example.codebreaker.Dto.RoomResponse::fromEntity)
                .toList();
    }

    @GetMapping("/public")
    public List<PublicRoomResponse> listPublicRoomsMapped() {
        List<Room> rooms = roomService.listPublicRooms();
        return rooms.stream().map(r -> PublicRoomResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .playersCount(r.getPlayers() == null ? 0 : r.getPlayers().size())
                .minPlayersToStart(r.getMinPlayersToStart())
                .privateRoom(r.isPrivateRoom())
                .build()).toList();
    }

    @GetMapping("/{roomId}")
    public com.example.codebreaker.Dto.RoomResponse getRoom(@PathVariable Long roomId) {
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(roomService.getRoom(roomId));
    }

    @GetMapping("/{roomId}/leaderboard")
    public List<LeaderboardEntry> getLeaderboard(@PathVariable Long roomId) {
        String lbKey = "room:" + roomId + ":leaderboard";
        Set<ZSetOperations.TypedTuple<Object>> range = redisTemplate.opsForZSet().reverseRangeWithScores(lbKey, 0, -1);
        
        if (range == null || range.isEmpty()) {
            return Collections.emptyList();
        }

        return range.stream().map(tuple -> LeaderboardEntry.builder()
                .username(Objects.requireNonNull(tuple.getValue()).toString())
                .score(Objects.requireNonNull(tuple.getScore()).intValue())
                .build()).collect(Collectors.toList());
    }

    @GetMapping("/{roomId}/submissions")
    public List<Submission> getTopSubmissions(@PathVariable Long roomId) {

        Room room = roomService.getRoom(roomId);
        if (room == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found");
        }

        List<Submission> submissions = submissionRepository.findByRoomOrderBySubmittedAtDesc(room);

        
        if (room.getProblemStartTime() == null || room.getCorrectAnswerCount() >= room.getMaxCorrectAnswers()) {
            return submissions;
        }

        Instant startTime = room.getProblemStartTime();
        Instant endTime = room.getProblemDuration() != null
                ? startTime.plusSeconds(room.getProblemDuration())
                : null;

        Long currentProblemId = room.getCurrentProblem() != null
                ? room.getCurrentProblem().getId()
                : null;

        List<Submission> filtered = new ArrayList<>();

        for (Submission submission : submissions) {

            
            boolean isCurrentProblem = currentProblemId != null &&
                    submission.getProblem() != null &&
                    currentProblemId.equals(submission.getProblem().getId());

            Instant submittedAt = submission.getSubmittedAt();

            boolean duringActiveWindow = false;

            if (submittedAt != null) {
                if (endTime != null) {
                    duringActiveWindow = !submittedAt.isBefore(startTime) && submittedAt.isBefore(endTime);
                } else {
                    duringActiveWindow = !submittedAt.isBefore(startTime);
                }
            }

            
            if (!isCurrentProblem && !duringActiveWindow) {
                filtered.add(submission);
            }
        }

        return filtered;
    }

    @GetMapping("/me")
    public com.example.codebreaker.Dto.RoomResponse getMyRoom() {
        Player player = playerService.getAuthenticatedPlayer()
                .orElseThrow(() -> new RuntimeException("Not logged in"));

        com.example.codebreaker.model.Room room = player.getRoom();
        if (room != null) room.getPlayers().size();
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(room);
    }

    @GetMapping("/me/room")
    public com.example.codebreaker.Dto.RoomResponse getMyRoomById(@RequestParam Long playerId) {
        com.example.codebreaker.model.Room room = playerService.findById(playerId)
                .map(Player::getRoom)
                .orElse(null);
        if (room != null) room.getPlayers().size();
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(room);
    }

    @PostMapping("/{roomId}/join")
    public com.example.codebreaker.Dto.RoomResponse joinRoom(@PathVariable Long roomId, @RequestBody Map<String, String> payload) {
        Long playerId = extractPlayerId(payload);
        roomService.joinRoom(roomId, playerId);
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(roomService.getRoom(roomId));
    }

    @PostMapping("/join")
    public com.example.codebreaker.Dto.RoomResponse joinRoomByCode(@RequestBody Map<String, String> payload) {
        Long playerId = extractPlayerId(payload);
        String joinCode = payload.get("joinCode");
        if (joinCode == null || joinCode.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "joinCode is required");
        }

        com.example.codebreaker.model.Room room = roomService.joinRoomByCode(joinCode, playerId);
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(room);
    }

    @PostMapping("/{roomId}/problem")
    public com.example.codebreaker.Dto.RoomResponse setProblem(@PathVariable Long roomId, @RequestBody Problem problem) {
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(roomService.setProblem(roomId, problem));
    }

    @PostMapping("/{roomId}/maxCorrectAnswers")
    public com.example.codebreaker.Dto.RoomResponse setMaxCorrectAnswers(@PathVariable Long roomId, @RequestBody Map<String, Integer> payload) {
        Integer maxAnswers = payload.get("maxCorrectAnswers");
        if (maxAnswers == null || maxAnswers < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "maxCorrectAnswers must be >= 1");
        }
        return com.example.codebreaker.Dto.RoomResponse.fromEntity(roomService.setMaxCorrectAnswers(roomId, maxAnswers));
    }

    @PostMapping("/{roomId}/submit")
    public String submitAnswer(@PathVariable Long roomId, @RequestBody Map<String, String> payload) {
        Long playerId = null;
        if (payload != null) {
            String idStr = payload.get("playerId");
            if (idStr != null) {
                try {
                    playerId = Long.valueOf(idStr);
                } catch (NumberFormatException ex) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId must be a number");
                }
            }
        }

        if (playerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId is required");
        }

        String answer = payload.get("answer");
        return roomService.submitAnswer(roomId, playerId, answer);
    }

    @DeleteMapping("/{roomId}")
    public String deleteRoom(@PathVariable Long roomId, @RequestBody Map<String, String> payload) {
        Long playerId = extractPlayerId(payload);
        return roomService.deleteRoom(roomId, playerId);
    }

    @PostMapping("/me/leave")
    public String leaveMyRoom() {
        Player player = playerService.getAuthenticatedPlayer()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));

        Room room = player.getRoom();
        if (room == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Player is not in any room");
        }

        return roomService.leaveRoom(room.getId(), player.getId());
    }

    @PostMapping("/{roomId}/leave")
    public String leaveRoom(@PathVariable Long roomId, @RequestBody Map<String, String> payload) {
        Long playerId = extractPlayerId(payload);
        return roomService.leaveRoom(roomId, playerId);
    }

    private Long extractPlayerId(Map<String, ?> payload) {
        if (payload == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body required");

        Object idObj = payload.get("playerId");
        if (idObj != null) {
            if (idObj instanceof Number) return ((Number) idObj).longValue();
            if (idObj instanceof String) {
                try {
                    return Long.valueOf((String) idObj);
                } catch (NumberFormatException ex) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId must be a number");
                }
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId must be a number");
        }

        Object usernameObj = payload.get("username");
        if (usernameObj != null) {
            String username = usernameObj.toString();
            return playerService.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found"))
                    .getId();
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "playerId or username is required");
    }
}
