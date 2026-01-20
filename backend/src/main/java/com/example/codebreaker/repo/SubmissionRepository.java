package com.example.codebreaker.repo;

import com.example.codebreaker.model.Submission;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    boolean existsByPlayerAndProblemAndPassedTrue(RoomPlayer player, Problem problem);
    
    List<Submission> findByRoomOrderBySubmittedAtDesc(Room room);
    
    @Query("SELECT s FROM Submission s WHERE s.room.id = :roomId ORDER BY s.id DESC LIMIT 3")
    List<Submission> findTop3ByRoomId(@Param("roomId") Long roomId);
    
    void deleteByPlayer(RoomPlayer player);
}
