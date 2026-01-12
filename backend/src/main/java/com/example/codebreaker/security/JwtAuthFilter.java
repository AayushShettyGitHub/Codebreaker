package com.example.codebreaker.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (c.getName().equals("token")) {
                    try {
                        Claims claims = jwtUtil.validateToken(c.getValue());
                        String username = claims.get("username", String.class);
                        String role = claims.get("role", String.class);

                        UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            );

                        Object idObj = claims.get("id");
                        if (idObj instanceof Number) {
                            auth.setDetails(((Number) idObj).longValue());
                        } else if (idObj != null) {
                            try {
                            auth.setDetails(Long.valueOf(idObj.toString()));
                            } catch (NumberFormatException ignored) {
                            }
                        }

                        SecurityContextHolder.getContext().setAuthentication(auth);
                    } catch (Exception e) {
                       
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
