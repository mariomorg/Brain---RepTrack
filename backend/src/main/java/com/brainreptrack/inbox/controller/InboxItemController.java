package com.brainreptrack.inbox.controller;

import com.brainreptrack.inbox.dto.InboxItemRequestDto;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;
import com.brainreptrack.inbox.service.InboxItemService;
import com.brainreptrack.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inbox")
@RequiredArgsConstructor
public class InboxItemController {

    private final InboxItemService service;

    @PostMapping
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> create(
            @Valid @RequestBody InboxItemRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.create(dto)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InboxItemResponseDto>>> findAll() {
        return ResponseEntity.ok(ApiResponse.ok(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findById(id)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<InboxItemResponseDto>>> findByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByStatus(status)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody InboxItemRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/count/pending")
    public ResponseEntity<ApiResponse<Long>> countPending() {
        return ResponseEntity.ok(ApiResponse.ok(service.countPending()));
    }
}
