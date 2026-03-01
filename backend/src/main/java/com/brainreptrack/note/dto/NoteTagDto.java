package com.brainreptrack.note.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for a tag with an optional per-tag confidence level.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteTagDto {

    private String name;

    /** Optional per-tag confidence level (0.0–1.0). Null when not set. */
    private Double confidenceLevel;
}
