package com.example.codebreaker.services;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.model.Role;
import com.example.codebreaker.repo.PlayerRepository;
import com.example.codebreaker.repo.RoomPlayerRepository;
import com.example.codebreaker.repo.RoomRepository;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

    private final PlayerRepository playerRepo;
    private final RoomRepository roomRepo;
    private final RoomPlayerRepository roomPlayerRepo;
    private final PasswordEncoder passwordEncoder;

    public PlayerService(PlayerRepository playerRepo,
                         RoomRepository roomRepo,
                         RoomPlayerRepository roomPlayerRepo,
                         PasswordEncoder passwordEncoder) {
        this.playerRepo = playerRepo;
        this.roomRepo = roomRepo;
        this.roomPlayerRepo = roomPlayerRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public Player signup(String username, String rawPassword) {
        if (username == null || username.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "username and password are required");
        }

        if (playerRepo.findByUsername(username).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        Player player = Player.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.MEMBER)
                .build();

        return playerRepo.save(player);
    }

    public Player login(String username, String rawPassword) {
        Player player = playerRepo.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(rawPassword, player.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        return player;
    }

    public Player joinRoom(Long roomId, Long playerId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        Player player = playerRepo.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        if (player.getRoom() != null) {
            throw new RuntimeException("Player already in a room");
        }

        player.setRoom(room);
        return playerRepo.save(player);
    }

    public Player leaveRoom(Long playerId) {
        Player player = playerRepo.findById(playerId)
                .orElseThrow(() -> new RuntimeException("Player not found"));

        Room room = player.getRoom();
        if (room == null) {
            throw new RuntimeException("Player is not in any room");
        }

        if (room.getAdmin().getId().equals(playerId)) {
            roomRepo.delete(room);
            player.setRoom(null);
            return playerRepo.save(player);
        }

        room.getPlayers().removeIf(rp -> rp.getPlayer() != null && rp.getPlayer().getId().equals(playerId));
        player.setRoom(null);

        roomRepo.save(room);
        return playerRepo.save(player);
    }

    public List<RoomPlayer> getRoomPlayers(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        return roomPlayerRepo.findByRoom(room);
    }

    public Player getByUsernameAndRoom(String username, Room room) {
        return playerRepo.findByUsernameAndRoom(username, room)
                .orElseThrow(() -> new RuntimeException("Player not found in the room"));
    }

    public Optional<Player> findById(Long id) {
        return playerRepo.findById(id);
    }

    public Optional<Player> findByUsername(String username) {
        return playerRepo.findByUsername(username);
    }

    public Player save(Player player) {
        return playerRepo.save(player);
    }

    public Optional<Player> getAuthenticatedPlayer() {
        try {
            String username = SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getName();
            if (username != null && !username.isEmpty()) {
                return playerRepo.findByUsername(username);
            }
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
