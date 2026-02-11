package com.example.codebreaker.controller;

import com.example.codebreaker.Dto.AuthRequest;
import com.example.codebreaker.Dto.AuthResponse;
import com.example.codebreaker.model.Player;
import com.example.codebreaker.security.JwtUtil;
import com.example.codebreaker.services.PlayerService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PlayerService playerService;
    private final JwtUtil jwtUtil;

    public AuthController(PlayerService playerService, JwtUtil jwtUtil) {
        this.playerService = playerService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody AuthRequest request) {
        Player player = playerService.signup(request.getUsername(), request.getPassword());
        
        AuthResponse response = AuthResponse.builder()
                .id(player.getId())
                .username(player.getUsername())
                .role(player.getRole().name())
                .message("Signup successful")
                .build();
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
        Player player = playerService.login(request.getUsername(), request.getPassword());

        String token = jwtUtil.generateToken(player.getUsername(), player.getId(), player.getRole().name());

        ResponseCookie cookie = ResponseCookie.from("token", token)
                .httpOnly(true)
                .path("/")
                .maxAge(60 * 60)
                .sameSite("Strict")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());

        AuthResponse authResponse = AuthResponse.builder()
                .id(player.getId())
                .username(player.getUsername())
                .role(player.getRole().name())
                .message("Login successful")
                .build();

        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        Object idObj = authentication.getDetails();
        Map<String, Object> user = Map.of(
                "id", idObj,
                "username", authentication.getName(),
                "roles", authentication.getAuthorities()
        );

        return ResponseEntity.ok(user);
    }
}
