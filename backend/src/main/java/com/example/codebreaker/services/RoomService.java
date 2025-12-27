package com.example.codebreaker.services;

import com.example.codebreaker.model.Player;
import java.util.Objects;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.model.TestCase;
import com.example.codebreaker.repo.RoomRepository;
import com.example.codebreaker.repo.RoomPlayerRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomService {

    private final RoomRepository roomRepo;
    private final RoomPlayerRepository roomPlayerRepo;
    private final PlayerService playerService;
    private final com.example.codebreaker.repo.ProblemRepository problemRepo;

    public RoomService(RoomRepository roomRepo, RoomPlayerRepository roomPlayerRepo, PlayerService playerService, com.example.codebreaker.repo.ProblemRepository problemRepo) {
        this.roomRepo = roomRepo;
        this.roomPlayerRepo = roomPlayerRepo;
        this.playerService = playerService;
        this.problemRepo = problemRepo;
    }

    public Room createRoom(Long playerId, String name) {
        Player creator = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (creator.getRoom() != null) {
            throw new RuntimeException("Player already created/joined a room");
        }

        // Set creator role as ADMIN
        creator.setRole(com.example.codebreaker.model.Role.ADMIN);

        String code = generateCode();

        Room room = Room.builder()
            .name(name)
            .admin(creator)
            .joinCode(code)
            .players(new ArrayList<>())
            .maxCorrectAnswers(1) // default: 1 correct answer locks problem
            .correctAnswerCount(0)
            .build();

        room = roomRepo.save(room);

        // associate creator with room
        creator.setRoom(room);
        playerService.save(creator);

        // create RoomPlayer entry
        RoomPlayer rp = new RoomPlayer();
        rp.setRoom(room);
        rp.setPlayer(creator);
        rp.setScore(0);
        rp.setHasAnsweredCorrectly(false);
        rp.setCorrectAnswerTimestamp(null);
        roomPlayerRepo.save(rp);

        return roomRepo.findById(room.getId()).orElse(room);
    }

    private String generateCode() {
        return "RM-" + (int)(Math.random() * 90000 + 10000);
    }

    public List<Room> listRooms() {
        return roomRepo.findAll();
    }

    public Player joinRoom(Long roomId, Long playerId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Player player = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (player.getRoom() != null) {
            throw new RuntimeException("Player already in a room");
        }

        player.setRoom(room);
        playerService.save(player);

        RoomPlayer rp = new RoomPlayer();
        rp.setRoom(room);
        rp.setPlayer(player);
        rp.setScore(0);
        roomPlayerRepo.save(rp);

        return player;
    }

    public RoomPlayer addPlayerToRoom(Room room, Player player) {
        RoomPlayer rp = new RoomPlayer();
        rp.setRoom(room);
        rp.setPlayer(player);
        rp.setScore(0);
        return roomPlayerRepo.save(rp);
}


    public Room joinRoomByCode(String joinCode, Long playerId) {
    Player player = playerService.findById(playerId)
            .orElseThrow(() -> new RuntimeException("Player not found"));

    if (player.getRoom() != null) {
        throw new RuntimeException("Player already in a room");
    }

        Room room = roomRepo.findAll().stream()
            .filter(r -> r.getJoinCode().equals(joinCode))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Invalid join code"));

        player.setRoom(room);
        playerService.save(player);

        RoomPlayer rp = new RoomPlayer();
        rp.setRoom(room);
        rp.setPlayer(player);
        rp.setScore(0);
        roomPlayerRepo.save(rp);

        return roomRepo.findById(room.getId()).orElse(room);
}


    public Room setProblem(Long roomId, Problem problem) {
    Room room = roomRepo.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

    problem.setRoom(room);

    if (problem.getTestCases() != null) {
        for (TestCase tc : problem.getTestCases()) {
            tc.setProblem(problem);
        }
    }

    room.setCurrentProblem(problem);
    return roomRepo.save(room);
}


    public Room getRoom(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.getPlayers().size(); // force load players
        return room;
    }

    public Room setMaxCorrectAnswers(Long roomId, Integer maxAnswers) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setMaxCorrectAnswers(maxAnswers);
        return roomRepo.save(room);
    }

    // ------------------ Leave Room ------------------

/**
 * Player leaves the room. If the player is the admin, the room is deleted.
 */
public String leaveRoom(Long roomId, Long playerId) {
    Room room = roomRepo.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

    Player player = playerService.findById(playerId)
            .orElseThrow(() -> new RuntimeException("Player not found"));

    // Admin leaves → delete the room
    if (room.getAdmin() != null && Objects.equals(room.getAdmin().getId(), playerId)) {
        return deleteRoom(roomId, playerId); // reuse existing delete logic
    }

    // Remove RoomPlayer entry for this player
    roomPlayerRepo.findByRoomAndPlayer(room, player).ifPresent(rp -> roomPlayerRepo.delete(rp));

    // Dissociate player from room
    player.setRoom(null);
    playerService.save(player);

    roomRepo.save(room);
    return "Player left the room.";
}

/**
 * Player leaves their current room without needing the roomId explicitly.
 */
public String leaveMyRoom(Player player) {
    Room room = player.getRoom();
    if (room == null) {
        throw new RuntimeException("Player is not in any room");
    }
    return leaveRoom(room.getId(), player.getId());
}


    public List<Room> getRoomsForPlayer(Long playerId) {
        Player player = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        return roomPlayerRepo.findByPlayer(player).stream()
                .map(RoomPlayer::getRoom)
                .toList();
    }

    @Transactional
    public String deleteRoom(Long roomId, Long requestingPlayerId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getAdmin() == null || !Objects.equals(room.getAdmin().getId(), requestingPlayerId)) {
            throw new RuntimeException("Only the room admin can delete the room");
        }

        // If a current problem exists, remove its reference and delete it explicitly
        if (room.getCurrentProblem() != null) {
            Problem prob = room.getCurrentProblem();
            // break link from problem to room
            prob.setRoom(null);
            problemRepo.save(prob);
            problemRepo.delete(prob);
            room.setCurrentProblem(null);
            roomRepo.save(room);
        }

        // For each player in the room, dissociate them and remove RoomPlayer entries
        List<RoomPlayer> rps = roomPlayerRepo.findByRoom(room);
        for (RoomPlayer rp : rps) {
            Player p = rp.getPlayer();
            if (p != null) {
                p.setRoom(null);
                playerService.save(p);
            }
            roomPlayerRepo.delete(rp);
        }

        // If the admin still references the room (edge cases), clear it
        Player admin = room.getAdmin();
        if (admin != null && admin.getRoom() != null && admin.getRoom().getId().equals(room.getId())) {
            admin.setRoom(null);
            playerService.save(admin);
        }

        // Finally delete the room
        roomRepo.delete(room);

        return "Room deleted.";
    }

    public String submitAnswer(Long roomId, Long playerId, String answer) {
        Room room = roomRepo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        Player player = playerService.findById(playerId).orElseThrow(() -> new RuntimeException("Player not found"));

        RoomPlayer rp = roomPlayerRepo.findByRoomAndPlayer(room, player)
                .orElseThrow(() -> new RuntimeException("Player not in room"));

        // Check if problem is locked (max correct answers reached)
        if (room.getCorrectAnswerCount() >= room.getMaxCorrectAnswers()) {
            return "Problem locked: Maximum correct answers reached.";
        }

        // Check if player already answered correctly
        if (rp.isHasAnsweredCorrectly()) {
            return "Already answered: You cannot submit another correct answer for this problem.";
        }

        if (room.getCurrentProblem() != null && Objects.equals(room.getCurrentProblem().getAnswer(), answer)) {
            // Correct answer!
            long timestamp = System.currentTimeMillis();
            rp.setHasAnsweredCorrectly(true);
            rp.setCorrectAnswerTimestamp(timestamp);
            
            // Calculate time-based score (higher score for faster answers)
            // Score = 100 - (time in seconds / 10), minimum 10 points
            long timeTaken = (timestamp - room.getCurrentProblem().getCreatedAt()) / 1000; // seconds
            int timeScore = Math.max(10, 100 - (int)(timeTaken / 10));
            int newScore = rp.getScore() + timeScore;
            
            rp.setScore(newScore);
            roomPlayerRepo.save(rp);
            
            // Increment room's correct answer count
            room.setCorrectAnswerCount(room.getCorrectAnswerCount() + 1);
            roomRepo.save(room);
            
            return "Correct! Score: +" + timeScore + " (Total: " + newScore + ")";
        } else {
            return "Wrong!";
        }
    }
}
