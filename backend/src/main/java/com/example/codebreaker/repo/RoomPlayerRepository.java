package com.example.codebreaker.repo;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.RoomPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomPlayerRepository extends JpaRepository<RoomPlayer, Long> {
    Optional<RoomPlayer> findByRoomAndPlayer(Room room, Player player);
    List<RoomPlayer> findByRoom(Room room);
    List<RoomPlayer> findByPlayer(Player player);
    Optional<RoomPlayer> findByRoomIdAndPlayerId(Long roomId, Long playerId);
}
