package com.brainreptrack.note.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class NoteResponseDto {

    private UUID id;
    private String title;
    private String path;
    private String type;
    private String summary;
    private LocalDateTime createdAt;
    private UUID inboxItemId;
    private Double confidenceScore;
    /** Tags from note_tags with optional per-tag confidence level. */
    private Set<NoteTagDto> tags;
}
