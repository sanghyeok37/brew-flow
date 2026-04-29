package com.brewflow.api.config.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);
        if (token != null && !token.isBlank()) {
            try {
                AuthenticatedUser auth = tokenProvider.getAuthenticatedUser(token);

                if (auth != null && auth.getRole() != null) {
                    List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(auth.getRole().getAuthority()));
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(auth,
                            null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (JwtException e) {
                log.debug("JWT parse failed: {}", e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            return auth.substring("Bearer ".length()).trim();
        }
        // EventSource는 Authorization 헤더를 직접 설정하기 어려워, SSE 구독에 한해 query param 토큰을 허용
        if ("/api/v1/notifications/subscribe".equals(request.getRequestURI())) {
            return request.getParameter("access_token");
        }
        return null;
    }
}
