package com.example.codebreaker.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicRoomResponse {
    private Long id;
    private String name;
    private int playersCount;
    private int minPlayersToStart;
    private String joinCode;
    private boolean privateRoom;
}
