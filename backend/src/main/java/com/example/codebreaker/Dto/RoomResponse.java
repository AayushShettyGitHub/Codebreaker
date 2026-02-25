package com.example.codebreaker.Dto;

import com.example.codebreaker.model.Room;
import com.example.codebreaker.model.RoomPlayer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {
    private Long id;
    private String name;
    private boolean privateRoom;
    private String joinCode;
    private Integer maxCorrectAnswers;
    private Integer correctAnswerCount;
    private Instant problemStartTime;
    private Integer problemDuration;
    private Integer minPlayersToStart;
    private ProblemResponse currentProblem;
    private PlayerResponse admin;
    private List<String> playerUsernames;

    public static RoomResponse fromEntity(Room room) {
        if (room == null) return null;

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .privateRoom(room.isPrivateRoom())
                .joinCode(room.getJoinCode())
                .maxCorrectAnswers(room.getMaxCorrectAnswers())
                .correctAnswerCount(room.getCorrectAnswerCount())
                .problemStartTime(room.getProblemStartTime())
                .problemDuration(room.getProblemDuration())
                .minPlayersToStart(room.getMinPlayersToStart())
                .currentProblem(ProblemResponse.fromEntity(room.getCurrentProblem()))
                .admin(PlayerResponse.fromEntity(room.getAdmin()))
                .playerUsernames(room.getPlayers() != null ? 
                    room.getPlayers().stream()
                        .map(rp -> rp.getPlayer().getUsername())
                        .collect(Collectors.toList()) : null)
                .build();
    }
}
