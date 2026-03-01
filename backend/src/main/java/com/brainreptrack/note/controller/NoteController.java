package com.brainreptrack.note.controller;

import com.brainreptrack.note.dto.FolderSummaryRequestDto;
import com.brainreptrack.note.dto.NoteRequestDto;
import com.brainreptrack.note.dto.NoteResponseDto;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.note.service.NoteService;
import com.brainreptrack.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLConnection;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService service;
    private final NoteRepository noteRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponseDto>> create(@Valid @RequestBody NoteRequestDto dto) {
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
    public ResponseEntity<ApiResponse<List<NoteResponseDto>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok(service.search(q)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponseDto>> update(
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequestDto dto
    ) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/tags")
    public ResponseEntity<ApiResponse<List<String>>> getAllTags() {
        return ResponseEntity.ok(ApiResponse.ok(service.getAllTags()));
    }

    @GetMapping("/tag/{tagName}")
    public ResponseEntity<ApiResponse<List<NoteResponseDto>>> findByTag(@PathVariable String tagName) {
        return ResponseEntity.ok(ApiResponse.ok(service.findByTag(tagName)));
    }

    @GetMapping("/{id}/similares")
    public ResponseEntity<ApiResponse<List<NoteResponseDto>>> findSimilares(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(service.findSimilares(id)));
    }

    /**
     * Generates an AI summary for all notes inside a leaf folder.
     * Accepts the folder name/path and the list of note IDs.
     * Returns a free-text paragraph summarising the folder's contents.
     */
    @PostMapping("/folder-summary")
    public ResponseEntity<ApiResponse<String>> folderSummary(
            @RequestBody FolderSummaryRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.generateFolderSummary(dto)));
    }

    /**
     * Serves the original uploaded file for notes of type FILE.
     * Returns the raw bytes with the appropriate Content-Type so browsers can
     * render PDFs, images and plain-text files inline.
     * Pass ?dl=1 to force a download (Content-Disposition: attachment).
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> serveFile(
            @PathVariable UUID id,
            @RequestParam(value = "dl", required = false, defaultValue = "0") String dl) {
        var noteOpt = noteRepository.findById(id);
        if (noteOpt.isEmpty()) return ResponseEntity.notFound().build();

        var note = noteOpt.get();
        if (note.getInboxItem() == null || note.getInboxItem().getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(note.getInboxItem().getFilePath());
        Resource resource = new PathResource(filePath);
        if (!resource.exists()) return ResponseEntity.notFound().build();

        String filename = filePath.getFileName().toString();
        // Strip the UUID prefix (uuid_originalname.ext)
        int underscore = filename.indexOf('_');
        String originalName = underscore >= 0 ? filename.substring(underscore + 1) : filename;

        String contentType = URLConnection.guessContentTypeFromName(originalName);
        if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;

        boolean forceDownload = "1".equals(dl);
        String disposition = forceDownload
                ? "attachment; filename=\"" + originalName + "\""
                : "inline; filename=\"" + originalName + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}