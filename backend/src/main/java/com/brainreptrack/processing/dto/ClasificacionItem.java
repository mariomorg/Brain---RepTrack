package com.brainreptrack.processing.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

/**
 * One level of the hierarchical classification returned by the AI
 * when existing tags are present.
 *
 * Example JSON:
 * { "nivel": 2, "etiqueta": "programacion", "confianza": 82 }
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ClasificacionItem {

    /** Depth level: 1 = root, 2 = child, 3 = grandchild. */
    private int nivel;

    /** Bare tag name at this level, e.g. "programacion". */
    private String etiqueta;

    /**
     * Confidence as a percentage (0–100).
     * Divide by 100 to get the 0‒1 value stored on the Note.
     */
    private double confianza;
}
