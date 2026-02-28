package com.brainreptrack.processing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A single actionable suggestion returned by the AI analysis pipeline.
 * Designed to be serialised to JSON and consumed directly by the frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionDto {

    /** The kind of action this suggestion represents. */
    private SuggestionType type;

    /** Human-readable short label, e.g. "Resumir contenido". */
    private String label;

    /** Longer contextual description shown to the user. */
    private String description;

    /**
     * Confidence score (0–100) indicating how relevant this suggestion is
     * for the current content. Higher = more relevant.
     */
    private double confidence;

    /**
     * Whether this suggestion can be executed automatically right now.
     * When false the chip is rendered but disabled (coming soon).
     */
    @Builder.Default
    private boolean actionable = false;
}
