package com.brainreptrack.processing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Combined result returned by the unified "Procesar" endpoint.
 *
 * Encapsulates three independent but complementary outputs:
 * 1. The AI classification result (tag path + confidence).
 * 2. The generated Markdown note.
 * 3. A list of smart suggestions for further actions.
 *
 * Each part is produced by a decoupled component, making the system
 * extensible without touching the orchestration layer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessResultDto {

    /** The updated inbox item after processing. */
    private com.brainreptrack.inbox.dto.InboxItemResponseDto item;

    /** AI classification stored in proposalsJson (parsed for convenience). */
    private AiAnalysisResult classification;

    /** Generated Markdown document from the content + metadata. */
    private String markdown;

    /**
     * Extensive AI-generated summary of the topic (may include web-sourced
     * context).
     */
    private String aiSummary;

    /** Ordered list of smart suggestions (most relevant first). */
    private List<SuggestionDto> suggestions;
}
