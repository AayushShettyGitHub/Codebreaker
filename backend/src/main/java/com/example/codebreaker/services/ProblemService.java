package com.example.codebreaker.services;

import com.example.codebreaker.Dto.ProblemWithTestCasesRequest;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.TestCase;
import com.example.codebreaker.repo.ProblemRepository;
import com.example.codebreaker.repo.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final RoomRepository roomRepository;

    public ProblemService(
            ProblemRepository problemRepository,
            RoomRepository roomRepository
    ) {
        this.problemRepository = problemRepository;
        this.roomRepository = roomRepository;
    }

    public Problem getById(Long id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
    }

   @Transactional
public Problem createWithTestCases(
        Long roomId,
        ProblemWithTestCasesRequest request
) {
    Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));

    Problem problem = Problem.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .difficulty(request.getDifficulty())
            .room(room)
            .testCases(new ArrayList<>())
            .build();

    if (request.getTestCases() != null) {
        for (ProblemWithTestCasesRequest.TestCaseRequest tcReq : request.getTestCases()) {
            TestCase tc = TestCase.builder()
                    .input(tcReq.getInput())
                    .output(tcReq.getOutput())
                    .problem(problem)
                    .build();
            problem.getTestCases().add(tc);
        }
    }

    Problem savedProblem = problemRepository.save(problem);

    room.setCurrentProblem(savedProblem);
    room.setCorrectAnswerCount(0);
    room.setProblemStartTime(null);

    room.getPlayers().forEach(rp -> {
        rp.setHasAnsweredCorrectly(false);
        rp.setCorrectAnswerTimestamp(null);
        rp.setLastCorrectSubmissionTime(null);
    });

    roomRepository.save(room);

    return savedProblem;
}
}
