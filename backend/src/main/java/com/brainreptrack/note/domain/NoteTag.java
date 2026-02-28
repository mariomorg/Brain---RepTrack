package com.brainreptrack.note.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Embedded element for the note_tags collection table.
 * {@code tagName} is mandatory; {@code confidenceLevel} (0.0–1.0) is optional.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteTag {

    @Column(name = "tag_name", length = 128, nullable = false)
    private String tagName;

    /** Optional per-tag confidence level (0.0–1.0). Null when not set. */
    @Column(name = "confidence_level")
    private Double confidenceLevel;
}
