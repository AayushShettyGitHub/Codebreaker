package com.example.codebreaker.services;
import java.time.Duration;
import java.time.Instant;
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

    private int defaultMinPlayers;
    private final BadgeService badgeService;
    private final ScoringService scoringService;

    public RoomService(
            RoomRepository roomRepo,
            RoomPlayerRepository roomPlayerRepo,
            SubmissionRepository submissionRepo,
            PlayerService playerService,
            RoomSocketController roomSocketController,
            BadgeService badgeService,
            ScoringService scoringService
    ) {
        this.roomRepo = roomRepo;
        this.roomPlayerRepo = roomPlayerRepo;
        this.submissionRepo = submissionRepo;
        this.playerService = playerService;
        this.roomSocketController = roomSocketController;
        this.badgeService = badgeService;
        this.scoringService = scoringService;
    }

    @org.springframework.beans.factory.annotation.Value("${rooms.public.minPlayers:5}")
    public void setDefaultMinPlayers(int defaultMinPlayers) {
        this.defaultMinPlayers = defaultMinPlayers;
    }


    public Room createRoom(Long playerId, String name, Boolean privateRoom) {
        Player creator = playerService.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (creator.getRoom() != null) {
            throw new RuntimeException("Player already in a room");
        }

        creator.setRole(com.example.codebreaker.model.Role.ADMIN);

        Room.RoomBuilder rb = Room.builder()
                .name(name)
                .joinCode(generateCode())
                .players(new ArrayList<>())
                .maxCorrectAnswers(1)
                .correctAnswerCount(0)
                .minPlayersToStart(defaultMinPlayers);

        if (privateRoom != null && privateRoom) rb.privateRoom(true);

        Room room = rb.build();

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
        return  ""+(int) (Math.random() * 90000 + 10000);
    }

    public List<Room> listRooms() {
        return roomRepo.findAll();
    }

    public List<Room> listPublicRooms() {
        return roomRepo.findByPrivateRoomFalse();
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
        room.setProblemStartTime(null);
        room.setProblemDuration(null);

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

        roomSocketController.playerLeft(roomId, player);
        return "Player has left the room.";
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
            // delete submissions for the room first to avoid FK constraint when deleting players
            try {
                submissionRepo.deleteByRoom(room);
            } catch (Exception ignored) { }

            for (RoomPlayer rp : rps) {
                Player p = rp.getPlayer();
                if (p != null) {
                    p.setRoom(null);
                    playerService.save(p);
                }
           try { submissionRepo.deleteByPlayer(rp); } catch (Exception ignored) {}
                roomPlayerRepo.delete(rp);
            }

            room.setAdmin(null);
            room.setCurrentProblem(null);
            roomRepo.save(room);

            if (!room.isPrivateRoom()) {
                List<RoomPlayer> finalPlayers = roomPlayerRepo.findByRoom(room);
                finalPlayers.sort((a, b) -> Integer.compare(b.getScore(), a.getScore()));

                List<com.example.codebreaker.model.Submission> allSubmissions = submissionRepo.findByRoomOrderBySubmittedAtAsc(room);
                java.util.Map<Long, Integer> simulatedScores = new java.util.HashMap<>();
                java.util.Set<Long> wasLastAtSomePoint = new java.util.HashSet<>();

                for (RoomPlayer rp : finalPlayers) simulatedScores.put(rp.getId(), 0);

                for (com.example.codebreaker.model.Submission s : allSubmissions) {
                    if (s.isPassed()) {
                        com.example.codebreaker.model.Room fakeRoom = Room.builder().id(room.getId()).problemStartTime(room.getProblemStartTime()).correctAnswerCount(0).build();
                        com.example.codebreaker.model.RoomPlayer fakeRp = new com.example.codebreaker.model.RoomPlayer();
                        fakeRp.setId(s.getPlayer().getId());
                        fakeRp.setPlayer(s.getPlayer().getPlayer());
                        fakeRp.setScore(simulatedScores.getOrDefault(s.getPlayer().getId(), 0));

                        com.example.codebreaker.model.Submission fakeSub = com.example.codebreaker.model.Submission.builder()
                                .room(fakeRoom)
                                .player(fakeRp)
                                .problem(s.getProblem())
                                .submittedAt(s.getSubmittedAt())
                                .passed(true)
                                .build();

                        scoringService.applyScore(fakeSub);
                        int newScore = fakeRp.getScore();
                        simulatedScores.put(fakeRp.getId(), newScore);
                    }

                    int min = Integer.MAX_VALUE;
                    for (Integer sc : simulatedScores.values()) if (sc < min) min = sc;
                    for (java.util.Map.Entry<Long, Integer> e : simulatedScores.entrySet()) {
                        if (e.getValue() == min) wasLastAtSomePoint.add(e.getKey());
                    }
                }

                for (int i = 0; i < finalPlayers.size(); i++) {
                    RoomPlayer rp = finalPlayers.get(i);
                    Player p = rp.getPlayer();
                    int rank = i + 1;

                    if (rank == 1) {
                        badgeService.awardBadge(p, "ROOM_WINNER", "Room Winner", "Finished Rank 1 in a public room", com.example.codebreaker.model.BadgeCategory.ROOM_PERFORMANCE);
                        int newWins = (p.getTotalWins() == null ? 0 : p.getTotalWins()) + 1;
                        p.setTotalWins(newWins);
                        int newStreak = (p.getCurrentWinStreak() == null ? 0 : p.getCurrentWinStreak()) + 1;
                        p.setCurrentWinStreak(newStreak);
                        playerService.save(p);

                        if (newWins == 5) {
                            badgeService.awardBadge(p, "5_WINS", "5 Wins", "Won 5 public rooms", com.example.codebreaker.model.BadgeCategory.PARTICIPATION);
                        }

                        // Award/increment 3-win streak badge whenever streak >= 3
                        if (newStreak >= 3) {
                            badgeService.awardBadge(p, "3_WIN_STREAK", "3 Win Streak", "Won 3 public rooms in a row", com.example.codebreaker.model.BadgeCategory.PARTICIPATION);
                        }

                        // Award/increment 7-win streak badge whenever streak >= 7
                        if (newStreak >= 7) {
                            badgeService.awardBadge(p, "7_WIN_STREAK", "7 Win Streak", "Won 7 public rooms in a row", com.example.codebreaker.model.BadgeCategory.PARTICIPATION);
                        }

                        if (wasLastAtSomePoint.contains(rp.getId())) {
                            badgeService.awardBadge(p, "COMEBACK", "Comeback", "Solved last problem after being last at some point", com.example.codebreaker.model.BadgeCategory.ROOM_PERFORMANCE);
                        }
                    }

                    if (rank <= 3) {
                        badgeService.awardBadge(p, "PODIUM_FINISH", "Podium Finish", "Finished in top 3 in a public room", com.example.codebreaker.model.BadgeCategory.ROOM_PERFORMANCE);
                    }

                    long totalCorrect = submissionRepo.countByRoomAndPlayerAndPassedTrue(room, rp);
                    long totalSubmissions = submissionRepo.countByRoomAndPlayer(room, rp);
                    if (totalCorrect > 0 && totalSubmissions == totalCorrect) {
                        badgeService.awardBadge(p, "FLAWLESS", "Flawless", "Solved problems with zero wrong submissions in the room", com.example.codebreaker.model.BadgeCategory.ROOM_PERFORMANCE);
                    }
                }
            }

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

            Instant now = Instant.now();
            rp.setHasAnsweredCorrectly(true);
            rp.setCorrectAnswerTimestamp(now);
            
            long seconds = Duration.between(room.getProblemStartTime(), now).getSeconds();


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

        if (!room.isPrivateRoom()) {
            int newCount = (player.getPublicRoomsPlayedCount() == null ? 0 : player.getPublicRoomsPlayedCount()) + 1;
            player.setPublicRoomsPlayedCount(newCount);
            playerService.save(player);

            if (newCount == 1) {
                badgeService.awardBadge(player, "FIRST_PUBLIC_ROOM", "First Public Room", "Joined your first public room", com.example.codebreaker.model.BadgeCategory.PARTICIPATION);
            } else if (newCount == 5) {
                badgeService.awardBadge(player, "5_PUBLIC_ROOMS", "5 Public Rooms Played", "Played 5 public rooms", com.example.codebreaker.model.BadgeCategory.PARTICIPATION);
            } else if (newCount == 10) {
                badgeService.awardBadge(player, "10_PUBLIC_ROOMS", "10 Public Rooms Played", "Played 10 public rooms", com.example.codebreaker.model.BadgeCategory.PARTICIPATION);
            }
        }

        player.setRoom(room);
        playerService.save(player);

        roomSocketController.playerJoined(room.getId(), player);

        return player;
    }
}
