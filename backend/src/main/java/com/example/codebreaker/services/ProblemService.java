package com.example.codebreaker.services;

import com.example.codebreaker.Dto.ProblemWithTestCasesRequest;
import com.example.codebreaker.model.Problem;
import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.TestCase;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.repo.ProblemLibraryRepository;
import com.example.codebreaker.repo.ProblemRepository;
import com.example.codebreaker.repo.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final RoomRepository roomRepository;
    private final BadgeService badgeService;
    private final PlayerService playerService;
    private final ProblemLibraryRepository problemLibraryRepository;

    public ProblemService(
            ProblemRepository problemRepository,
            RoomRepository roomRepository,
            BadgeService badgeService,
            PlayerService playerService,
            ProblemLibraryRepository problemLibraryRepository
    ) {
        this.problemRepository = problemRepository;
        this.roomRepository = roomRepository;
        this.badgeService = badgeService;
        this.playerService = playerService;
        this.problemLibraryRepository = problemLibraryRepository;
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

        
        Player creator = playerService.getAuthenticatedPlayer().orElse(null);

        Problem problem = Problem.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .room(room)
                .createdBy(creator)
                .testCases(new ArrayList<>())
                .build();

        
        if (request.getTestCases() != null) {
            for (ProblemWithTestCasesRequest.TestCaseRequest tcReq : request.getTestCases()) {
                TestCase tc = TestCase.builder()
                        .input(tcReq.getInput())
                        .output(tcReq.getOutput())
                        .problem(problem)
                        .hidden(false)
                        .build();
                problem.getTestCases().add(tc);
            }
        }

        
        if (request.getLibraryProblemId() != null) {
            problemLibraryRepository.findById(request.getLibraryProblemId()).ifPresent(libProblem -> {
                
                if (libProblem.getHiddenTestCases() != null) {
                    for (var htc : libProblem.getHiddenTestCases()) {
                        TestCase tc = TestCase.builder()
                                .input(htc.getInput())
                                .output(htc.getOutput())
                                .problem(problem)
                                .hidden(true)
                                .build();
                        problem.getTestCases().add(tc);
                    }
                }
            });
        }

        
        if (request.getHiddenTestCases() != null) {
            for (ProblemWithTestCasesRequest.TestCaseRequest tcReq : request.getHiddenTestCases()) {
                TestCase tc = TestCase.builder()
                        .input(tcReq.getInput())
                        .output(tcReq.getOutput())
                        .problem(problem)
                        .hidden(true)
                        .build();
                problem.getTestCases().add(tc);
            }
        }

        Problem savedProblem = problemRepository.save(problem);

    
    if (creator != null) {
        creator.setTotalProblemsContributed((creator.getTotalProblemsContributed() == null ? 0 : creator.getTotalProblemsContributed()) + 1);
        playerService.save(creator);

        if (creator.getTotalProblemsContributed() == 1) {
            badgeService.awardBadge(
                    creator,
                    "CONTRIBUTOR",
                    "Contributor",
                    "Contributed a problem to a room",
                    com.example.codebreaker.model.BadgeCategory.PARTICIPATION
            );
        }
    }

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
