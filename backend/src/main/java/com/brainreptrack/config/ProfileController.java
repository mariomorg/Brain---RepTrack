package com.brainreptrack.config;

import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.note.repository.NoteRepository;
import com.brainreptrack.note.repository.TagRepository;
import com.brainreptrack.note.repository.RelationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Returns profile / stats data for the dashboard.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final NoteRepository noteRepository;
    private final TagRepository tagRepository;
    private final InboxItemRepository inboxItemRepository;
    private final RelationRepository relationRepository;

    @Value("${ollama.model:llama3:8b}")
    private String ollamaModel;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> s = new LinkedHashMap<>();

        // ── Notes ──
        long totalNotes = noteRepository.count();
        s.put("totalNotes", totalNotes);

        Map<String, Long> notesByType = new LinkedHashMap<>();
        for (String type : new String[] { "TEXT", "LINK", "FILE", "AUDIO", "VIDEO_REF", "IDEA", "VOICE_NOTE",
                "ARTICLE_REF" }) {
            long c = noteRepository.findByType(type).size();
            if (c > 0)
                notesByType.put(type, c);
        }
        s.put("notesByType", notesByType);

        // ── Tags ──
        long totalTags = tagRepository.count();
        long rootTags = tagRepository.findByParentNameIsNull().size();
        s.put("totalTags", totalTags);
        s.put("rootTags", rootTags);

        // ── Distinct tags used in notes ──
        s.put("tagsUsed", noteRepository.findAllDistinctTags().size());

        // ── Relations ──
        s.put("totalRelations", relationRepository.count());

        // ── Inbox ──
        Map<String, Long> inboxByStatus = new LinkedHashMap<>();
        for (String status : new String[] { "PENDING", "PROCESSING", "PROCESSED", "AWAITING_APPROVAL", "REJECTED",
                "ARCHIVED" }) {
            long c = inboxItemRepository.countByStatus(status);
            if (c > 0)
                inboxByStatus.put(status, c);
        }
        s.put("inboxByStatus", inboxByStatus);
        s.put("totalInbox", inboxItemRepository.count());

        // ── Model ──
        s.put("aiModel", ollamaModel);

        return ResponseEntity.ok(s);
    }
}
