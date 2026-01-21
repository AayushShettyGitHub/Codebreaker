package com.example.codebreaker.services;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.repo.RoomPlayerRepository;
import com.example.codebreaker.repo.RoomRepository;
import com.example.codebreaker.repo.SubmissionRepository;
import com.example.codebreaker.websockets.RoomSocketController;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class RoomService {

    private final RoomRepository roomRepo;
    private final RoomPlayerRepository roomPlayerRepo;
    private final SubmissionRepository submissionRepo;
    private final PlayerService playerService;
    private final RoomSocketController roomSocketController;

    public RoomService(
            RoomRepository roomRepo,
            RoomPlayerRepository roomPlayerRepo,
            SubmissionRepository submissionRepo,
            PlayerService playerService,
            RoomSocketController roomSocketController
    ) {
        this.roomRepo = roomRepo;
        this.roomPlayerRepo = roomPlayerRepo;
        this.submissionRepo = submissionRepo;
        this.playerService = playerService;
        this.roomSocketController = roomSocketController;
    }

    public Room createRoom(Long playerId, String name) {
        Player creator = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (creator.getRoom() != null) {
            throw new RuntimeException("Player already in a room");
        }

        creator.setRole(com.example.codebreaker.model.Role.ADMIN);

        Room room = Room.builder()
                .name(name)
                .joinCode(generateCode())
                .players(new ArrayList<>())
                .maxCorrectAnswers(1)
                .correctAnswerCount(0)
                .build();

        room = roomRepo.save(room);

        creator.setRoom(room);
        playerService.save(creator);

        RoomPlayer rp = new RoomPlayer();
        rp.setRoom(room);
        rp.setPlayer(creator);
        rp.setScore(0);
        rp.setHasAnsweredCorrectly(false);
        roomPlayerRepo.save(rp);

        room.setAdmin(creator);
        roomRepo.save(room);

        roomSocketController.roomCreated(room);
        return room;
    }

    private String generateCode() {
        return "RM-" + (int) (Math.random() * 90000 + 10000);
    }

    public List<Room> listRooms() {
        return roomRepo.findAll();
    }

    public Room joinRoomByCode(String joinCode, Long playerId) {
        Player player = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (player.getRoom() != null) {
            throw new RuntimeException("Player already in a room");
        }

        Room room = roomRepo.findByJoinCode(joinCode)
                .orElseThrow(() -> new RuntimeException("Invalid join code"));

        player.setRoom(room);
        playerService.save(player);

        RoomPlayer rp = new RoomPlayer();
        rp.setRoom(room);
        rp.setPlayer(player);
        rp.setScore(0);
        roomPlayerRepo.save(rp);

        roomSocketController.playerJoined(room.getId(), player);
        return room;
    }

    @Transactional
    public Room setProblem(Long roomId, Problem problem) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        problem.setRoom(room);

        room.setCurrentProblem(problem);
        room.setCorrectAnswerCount(0);
        room.setProblemStartTime(LocalDateTime.now());

        room.getPlayers().forEach(rp -> {
            rp.setHasAnsweredCorrectly(false);
            rp.setCorrectAnswerTimestamp(null);
            rp.setLastCorrectSubmissionTime(null);
        });

        Room saved = roomRepo.save(room);
        roomSocketController.problemSet(roomId, problem);
        return saved;
    }

    public Room setMaxCorrectAnswers(Long roomId, Integer maxAnswers) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setMaxCorrectAnswers(maxAnswers);
        room.setCorrectAnswerCount(0);
        Room saved = roomRepo.save(room);

        roomSocketController.maxCorrectSet(roomId, maxAnswers);
        return saved;
    }

    public Room getRoom(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.getPlayers().size();
        return room;
    }

    @Transactional
    public String leaveRoom(Long roomId, Long playerId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Player player = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (room.getAdmin() != null && Objects.equals(room.getAdmin().getId(), playerId)) {
            return deleteRoom(roomId, playerId);
        }

        roomPlayerRepo.findByRoomAndPlayer(room, player)
                .ifPresent(roomPlayer -> {
                    submissionRepo.deleteByPlayer(roomPlayer);
                    roomPlayerRepo.delete(roomPlayer);
                });

        player.setRoom(null);
        playerService.save(player);

        roomSocketController.playerKicked(roomId, player);
        return "Player kicked from the room.";
    }

    @Transactional
    public String deleteRoom(Long roomId, Long requestingPlayerId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!Objects.equals(room.getAdmin().getId(), requestingPlayerId)) {
            throw new RuntimeException("Only admin can delete the room");
        }

        try {
            List<RoomPlayer> rps = roomPlayerRepo.findByRoom(room);
            for (RoomPlayer rp : rps) {
                Player p = rp.getPlayer();
                if (p != null) {
                    p.setRoom(null);
                    playerService.save(p);
                }
                roomPlayerRepo.delete(rp);
            }

            room.setAdmin(null);
            room.setCurrentProblem(null);
            roomRepo.save(room);

            roomRepo.delete(room);
            roomSocketController.roomDeleted(roomId);
            return "Room deleted.";
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete room: " + e.getMessage(), e);
        }
    }

    public String submitAnswer(Long roomId, Long playerId, String answer) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Player player = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        RoomPlayer rp = roomPlayerRepo.findByRoomAndPlayer(room, player)
                .orElseThrow(() -> new RuntimeException("Player not in room"));

        if (!room.isProblemActive()) {
            return "Problem inactive.";
        }

        if (rp.isHasAnsweredCorrectly()) {
            return "Already solved.";
        }

        if (room.getCorrectAnswerCount() >= room.getMaxCorrectAnswers()) {
            return "Problem locked.";
        }

        if (room.getCurrentProblem() != null &&
                Objects.equals(room.getCurrentProblem().getAnswer(), answer)) {

            long now = System.currentTimeMillis();
            rp.setHasAnsweredCorrectly(true);
            rp.setCorrectAnswerTimestamp(now);

            long seconds =
                    java.time.Duration.between(
                            room.getProblemStartTime(),
                            LocalDateTime.now()
                    ).toSeconds();

            int score = Math.max(10, 100 - (int) seconds);
            rp.setScore(rp.getScore() + score);
            roomPlayerRepo.save(rp);

            room.setCorrectAnswerCount(room.getCorrectAnswerCount() + 1);
            roomRepo.save(room);

            roomSocketController.answerCorrect(roomId, player, rp.getScore());
            return "Correct +" + score;
        }

        return "Wrong";
    }

    @Transactional
    public Player joinRoom(Long roomId, Long playerId) {
        Player player = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (player.getRoom() != null) {
            throw new RuntimeException("Player already in a room");
        }

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        RoomPlayer rp = new RoomPlayer();
        rp.setRoom(room);
        rp.setPlayer(player);
        rp.setScore(0);
        rp.setHasAnsweredCorrectly(false);
        roomPlayerRepo.save(rp);

        player.setRoom(room);
        playerService.save(player);

        roomSocketController.playerJoined(room.getId(), player);

        return player;
    }
}
