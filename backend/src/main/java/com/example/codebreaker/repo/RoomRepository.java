package com.example.codebreaker.repo;

import com.example.codebreaker.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findById(int id);
    Optional<Room> findByJoinCode(String joinCode);
    List<Room> findByPrivateRoomFalse();

}
