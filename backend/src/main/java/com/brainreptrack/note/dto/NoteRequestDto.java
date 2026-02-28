package com.brainreptrack.note.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class NoteRequestDto {

    @NotBlank(message = "title must not be blank")
    private String title;

    private String path;

    private String type;

    private String summary;

    private UUID inboxItemId;

    /**
     * AI confidence score (0.0–1.0) from the path proposal that generated this
     * note.
     */
    private Double confidenceScore;

    /**
     * Tags with optional per-tag confidence level stored in
     * note_tags(note_id, tag_name, confidence_level).
     */
    private Set<NoteTagDto> tags;

    /**
     * Editable AI summary (markdown). When present, overwrites the ai_summary
     * stored in the linked InboxItem.
     */
    private String aiSummary;
}
