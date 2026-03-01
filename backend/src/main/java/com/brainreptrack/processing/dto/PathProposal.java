package com.brainreptrack.processing.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

/**
 * One path proposal returned by the AI, e.g.
 * { "path": "hogar/electrodomésticos/lavadoras", "confidence": 0.78 }
 */
@Data
public class PathProposal {

    private String path;

    /** Accept both "confidence" and "confidence_score" from AI output */
    @JsonAlias("confidence_score")
    private Double confidence;
}
