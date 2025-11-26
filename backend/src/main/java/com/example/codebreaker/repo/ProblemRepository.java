package com.example.codebreaker.repo;

import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {

    List<Problem> findByRoom(Room room);
}
