package com.brainreptrack.processing.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Structured result from the AI for a single inbox item.
 *
 * Both creation mode (no existing tags) and classification mode (tags exist)
 * now return the same format:
 *
 * {
 * "clasificacion": [
 * { "nivel": 1, "etiqueta": "tecnologia", "confianza": 88 },
 * { "nivel": 2, "etiqueta": "ia", "confianza": 75 }
 * ],
 * "clasificacion_final_valida": true,
 * "motivo": "Texto sobre modelos de lenguaje."
 * }
 *
 * The legacy creation-mode fields (paths / keywords / rationale) are kept
 * for backward compatibility with items processed before the prompt
 * unification, but are no longer emitted by the current prompts.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiAnalysisResult {

    // ── Classification mode fields ─────────────────────────────────────────

    /**
     * Ordered list of tag levels selected by the AI. May be null in creation mode.
     */
    private List<ClasificacionItem> clasificacion;

    /** True if the last selected level has confidence > 60%. */
    @JsonProperty("clasificacion_final_valida")
    private boolean clasificacionFinalValida;

    /** Brief explanation / rationale (both modes). */
    private String motivo;

    // ── Creation mode fields ───────────────────────────────────────────────

    /** Path proposals from the AI when no existing tags were available. */
    private List<PathProposal> paths;

    private List<String> keywords;

    /** Alias for motivo in creation mode response. */
    private String rationale;
}
