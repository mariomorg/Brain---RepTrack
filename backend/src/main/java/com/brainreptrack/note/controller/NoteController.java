package com.brainreptrack.note.controller;

import com.brainreptrack.note.dto.NoteRequestDto;
import com.brainreptrack.note.dto.NoteResponseDto;
import com.brainreptrack.note.service.NoteService;
import com.brainreptrack.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService service;

    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponseDto>> create(
            @Valid @RequestBody NoteRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.create(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoteResponseDto>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponseDto>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<NoteResponseDto>>> findByType(@PathVariable String type) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByType(type)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<NoteResponseDto>>> search(
            @RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(service.search(q)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponseDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
