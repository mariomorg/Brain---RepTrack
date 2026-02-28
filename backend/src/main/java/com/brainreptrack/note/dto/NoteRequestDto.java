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

    /** Tag names stored directly in note_tags(note_id, tag_name). */
    private Set<String> tags;
}
