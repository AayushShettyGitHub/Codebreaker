package com.example.codebreaker.repo;

import com.example.codebreaker.model.Submission;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.RoomPlayer;
import com.example.codebreaker.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {


    boolean existsByPlayerAndProblemAndPassedTrue(RoomPlayer player, Problem problem);
    List<Submission> findByRoomOrderBySubmittedAtDesc(Room room);
    List<Submission> findTop3ByRoomIdOrderByIdDesc(Long roomId);
    List<Submission> findByProblemIdAndPassedTrueOrderBySubmittedAtAsc(Long problemId, org.springframework.data.domain.Pageable pageable);
    void deleteByPlayer(RoomPlayer player);  
    void deleteByRoom(Room room);
    long countByRoomAndPlayer(Room room, RoomPlayer player);
    long countByRoomAndPlayerAndPassedTrue(Room room, RoomPlayer player);
    List<Submission> findByRoomOrderBySubmittedAtAsc(Room room);
    List<Submission> findBySubmittedAtBetween(java.time.Instant start, java.time.Instant end);
}
