package com.example.codebreaker.services;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.repo.PlayerRepository;
import com.example.codebreaker.repo.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlayerService {

    private final PlayerRepository playerRepo;
    private final RoomRepository roomRepo;

    public PlayerService(PlayerRepository playerRepo, RoomRepository roomRepo) {
        this.playerRepo = playerRepo;
        this.roomRepo = roomRepo;
    }

    public Player joinRoom(Long roomId, String playerName) {
        Optional<Room> roomOpt = roomRepo.findById(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            Player player = Player.builder()
                    .username(playerName)
                    .score(0)
                    .room(room)
                    .build();
            room.getPlayers().add(player);
            roomRepo.save(room); // Save the room along with new player
            return player;
        }
        throw new RuntimeException("Room not found");
    }

    public List<Player> getPlayers(Long roomId) {
        return playerRepo.findByRoom(roomRepo.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found")));
    }


    public Player getByUsernameAndRoom(String username, Room room) {
        return playerRepo.findByUsernameAndRoom(username, room)
                .orElseThrow(() -> new RuntimeException("Player not found in the room"));
    }

    public Player save(Player player) {
        return playerRepo.save(player);
    }
}