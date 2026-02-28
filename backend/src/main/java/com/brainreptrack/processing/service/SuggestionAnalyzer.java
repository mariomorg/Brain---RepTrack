package com.brainreptrack.processing.service;

import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.processing.dto.SuggestionDto;

import java.util.List;

/**
 * Analyses an {@link InboxItem} and returns context-aware, actionable
 * suggestions.
 *
 * <p>
 * This component is <strong>decoupled</strong> from both the AI
 * classification step and the Markdown generation step. It inspects
 * the item's content type, length, attached metadata, and (optionally)
 * the existing classification to propose follow-up actions.
 * </p>
 *
 * <h3>Extensibility</h3>
 * New suggestion strategies can be added by:
 * <ol>
 * <li>Adding a value to
 * {@link com.brainreptrack.processing.dto.SuggestionType}.</li>
 * <li>Implementing a private evaluator method in the default
 * implementation.</li>
 * </ol>
 */
public interface SuggestionAnalyzer {

    /**
     * Analyses the given inbox item and returns an ordered list of
     * suggestions (most relevant first).
     *
     * @param item the inbox item to analyse (must not be null)
     * @return list of suggestions, possibly empty – never null
     */
    List<SuggestionDto> analyze(InboxItem item);
}
