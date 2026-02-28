package com.brainreptrack.inbox.controller;

import com.brainreptrack.inbox.dto.InboxItemRequestDto;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;
import com.brainreptrack.inbox.service.InboxItemService;
import com.brainreptrack.processing.dto.ProcessResultDto;
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

    /**
     * Manually triggers (re-)processing of an inbox item through the AI.
     * Useful for retrying failed items or re-analysing existing ones.
     */
    @PostMapping("/{id}/process")
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> process(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.process(id)));
    }

    /**
     * Unified "Procesar" — creates Note + generates Markdown + analyzes
     * suggestions.
     * Replaces the old approve/reject flow.
     */
    @PostMapping("/{id}/procesar")
    public ResponseEntity<ApiResponse<ProcessResultDto>> processItem(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.processItem(id)));
    }

    /**
     * Generates a Markdown document from the item's raw content and AI proposals,
     * saves it as a .md file on disk, and returns the file path.
     */
    @PostMapping("/{id}/create-markdown")
    public ResponseEntity<ApiResponse<String>> createMarkdown(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.createMarkdown(id)));
    }
}
