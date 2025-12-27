package com.example.codebreaker.repo;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByRoom(Room room);

    Optional<Player> findByUsernameAndRoom(String username, Room room); //room

    Optional<Player> findByUsername(String username);  //for signup/login
}
