package com.brainreptrack.inbox.controller;

import com.brainreptrack.inbox.client.TranscriptionClient;
import com.brainreptrack.inbox.dto.CaptureRequestDto;
import com.brainreptrack.inbox.dto.InboxItemRequestDto;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;
import com.brainreptrack.inbox.service.FileTextExtractor;
import com.brainreptrack.inbox.service.InboxItemService;
import com.brainreptrack.processing.dto.ProcessResultDto;
import com.brainreptrack.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/inbox")
@RequiredArgsConstructor
public class InboxItemController {

    private final InboxItemService service;

    private final TranscriptionClient transcriptionClient;

    private final FileTextExtractor fileTextExtractor;

    @Value("${uploads.dir:./uploads}")
    private String uploadsDirStr;

    // =====================================================================
    // UNIFIED CAPTURE — single entry point for any content type
    // =====================================================================

    /**
     * Unified capture endpoint — accepts text, links, ideas, code, video refs,
     * article refs, and any other content type. Content type is auto-detected
     * when not specified by the caller.
     *
     * <p>
     * Usage examples:
     * 
     * <pre>
     * POST /api/inbox/capture  { "content": "una idea suelta" }
     * POST /api/inbox/capture  { "content": "https://youtube.com/...", "contentType": "VIDEO_REF" }
     * POST /api/inbox/capture  { "content": "function hello() {...}", "contentType": "CODE", "metadata": {"language": "js"} }
     * </pre>
     */
    @PostMapping("/capture")
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> capture(
            @Valid @RequestBody CaptureRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.capture(dto)));
    }

    /**
     * Voice-note capture — uploads audio, transcribes it, and feeds the
     * transcript into the unified capture pipeline as a VOICE_NOTE.
     */
    @PostMapping(value = "/capture/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> captureAudio(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("El archivo de audio está vacío"));
        }

        String transcript = transcriptionClient.transcribe(file);

        CaptureRequestDto captureDto = CaptureRequestDto.builder()
                .content(transcript)
                .contentType("VOICE_NOTE")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.capture(captureDto)));
    }

    /**
     * File capture — uploads a file (PDF, TXT, etc.), extracts its text content,
     * and feeds it into the unified capture pipeline as a FILE item.
     * An optional 'text' parameter can provide additional context from the user.
     */
    @PostMapping(value = "/capture/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> captureFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "text", required = false) String additionalText) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("El archivo está vacío"));
        }

        // 1. Save original file to disk
        String savedFilePath = null;
        try {
            Path uploadsDir = Paths.get(uploadsDirStr).toAbsolutePath();
            Files.createDirectories(uploadsDir);
            String uniqueName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = uploadsDir.resolve(uniqueName);
            Files.copy(file.getInputStream(), dest, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            savedFilePath = dest.toAbsolutePath().toString();
        } catch (IOException e) {
            log.error("[captureFile] Could not save file to disk: {}", e.getMessage(), e);
        }

        // 2. Extract text content from the file
        String extractedText = fileTextExtractor.extractText(file);

        // 3. Combine: user text + extracted content
        String content;
        if (additionalText != null && !additionalText.isBlank()) {
            content = additionalText.trim() + "\n\n--- Contenido del archivo: "
                    + file.getOriginalFilename() + " ---\n\n" + extractedText;
        } else {
            content = extractedText;
        }

        CaptureRequestDto captureDto = CaptureRequestDto.builder()
                .content(content)
                .contentType("FILE")
                .title(file.getOriginalFilename())
                .filePath(savedFilePath)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.capture(captureDto)));
    }

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

    /**
     * @deprecated Use {@code POST /capture/audio} instead.
     *             Kept for backward compatibility with older frontend versions.
     */
    @PostMapping(value = "/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<InboxItemResponseDto>> createFromAudio(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("El archivo de audio está vacío"));
        }

        String transcript = transcriptionClient.transcribe(file);

        InboxItemRequestDto dto = new InboxItemRequestDto();
        dto.setRawText(transcript);
        dto.setDetectedType("AUDIO");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(service.create(dto)));
    }

}
