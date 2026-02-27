package com.brainreptrack.session.controller;

import com.brainreptrack.session.dto.SessionRequestDto;
import com.brainreptrack.session.dto.SessionResponseDto;
import com.brainreptrack.session.service.SessionService;
import com.brainreptrack.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<ApiResponse<SessionResponseDto>> createSession(@Valid @RequestBody SessionRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(sessionService.createSession(dto)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SessionResponseDto>> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessionById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SessionResponseDto>>> getAllSessions() {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getAllSessions()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SessionResponseDto>>> getSessionsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(sessionService.getSessionsByUser(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
