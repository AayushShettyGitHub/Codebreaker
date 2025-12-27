package com.example.codebreaker.security;

import com.example.codebreaker.model.Player;
import com.example.codebreaker.repo.PlayerRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class PlayerDetailsService implements UserDetailsService {

    private final PlayerRepository playerRepo;

    public PlayerDetailsService(PlayerRepository playerRepo) {
        this.playerRepo = playerRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Player player = playerRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return org.springframework.security.core.userdetails.User
                .withUsername(player.getUsername())
                .password(player.getPassword())
                .roles(player.getRole().name()) // ADMIN or MEMBER
                .build();
    }
}
