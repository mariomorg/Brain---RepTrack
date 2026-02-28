package com.brainreptrack.auth.filter;

import com.brainreptrack.auth.service.JwtService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Lightweight JWT filter.
 * - Sets "userId" + "username" request attributes when a valid Bearer token is
 * present.
 * - Rejects requests to protected paths (/api/auth/me, /api/auth/profile)
 * without a valid token.
 * - All other endpoints remain open (no full Spring Security dependency
 * needed).
 */
@Component
@Order(1)
@RequiredArgsConstructor
public class JwtAuthFilter implements Filter {

    private final JwtService jwtService;

    /** Paths that require authentication */
    private static final String[] PROTECTED_PATHS = {
            "/api/auth/me",
            "/api/auth/profile"
    };

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String authHeader = request.getHeader("Authorization");

        // Try to extract user info from token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.validateToken(token)) {
                UUID userId = jwtService.getUserIdFromToken(token);
                String username = jwtService.getUsernameFromToken(token);
                request.setAttribute("userId", userId);
                request.setAttribute("username", username);
            }
        }

        // Check protected paths
        String path = request.getRequestURI();
        if (isProtectedPath(path) && request.getAttribute("userId") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"No autenticado\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private boolean isProtectedPath(String path) {
        for (String p : PROTECTED_PATHS) {
            if (path.equals(p))
                return true;
        }
        return false;
    }
}
