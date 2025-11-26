package com.example.codebreaker.services;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.repo.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    private final RoomRepository repo;

    public RoomService(RoomRepository repo) {
        this.repo = repo;
    }

    // Create a room
    public Room createRoom(Room room) {
        return repo.save(room);
    }

    
    public List<Room> listRooms() {
        return repo.findAll();
    }

    
    public Player joinRoom(Long roomId, Player player) {
        Optional<Room> roomOpt = repo.findById(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.getPlayers().add(player);
            player.setRoom(room);
            repo.save(room);
            return player;
        }
        throw new RuntimeException("Room not found");
    }

    public Room setProblem(Long roomId, Problem problem) {
        Optional<Room> roomOpt = repo.findById(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.setCurrentProblem(problem);
            return repo.save(room);
        }
        throw new RuntimeException("Room not found");
    }

  
    public Room getRoom(Long roomId) {
        return repo.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
    }
}
