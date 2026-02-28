package com.brainreptrack.note.controller;

import com.brainreptrack.note.dto.RelationRequestDto;
import com.brainreptrack.note.dto.RelationResponseDto;
import com.brainreptrack.note.service.RelationService;
import com.brainreptrack.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/relations")
@RequiredArgsConstructor
public class RelationController {

    private final RelationService service;

    @PostMapping
    public ResponseEntity<ApiResponse<RelationResponseDto>> create(
            @Valid @RequestBody RelationRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.create(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RelationResponseDto>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RelationResponseDto>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @GetMapping("/note/{noteId}/as-source")
    public ResponseEntity<ApiResponse<List<RelationResponseDto>>> findByNoteA(@PathVariable UUID noteId) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByNoteA(noteId)));
    }

    @GetMapping("/note/{noteId}/as-target")
    public ResponseEntity<ApiResponse<List<RelationResponseDto>>> findByNoteB(@PathVariable UUID noteId) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByNoteB(noteId)));
    }

    @PatchMapping("/{id}/validate")
    public ResponseEntity<ApiResponse<RelationResponseDto>> validate(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.validate(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
