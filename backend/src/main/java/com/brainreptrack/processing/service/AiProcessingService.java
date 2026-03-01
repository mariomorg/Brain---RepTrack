package com.brainreptrack.processing.service;

import com.brainreptrack.processing.dto.ProcessResultDto;

import java.util.UUID;

public interface AiProcessingService {

    /**
     * Asynchronously analyses the inbox item with the given id.
     *
     * The method:
     * 1. Sets the item status → PROCESSING
     * 2. Calls the Ollama AI for classification
     * 3. Stores the JSON result in proposals_json
     * 4. Sets the item status → AWAITING_APPROVAL
     *
     * On any error the status is reset to PENDING so the call can be retried.
     *
     * @param inboxItemId id of the InboxItem to process
     */
    void processAsync(UUID inboxItemId);

    /**
     * Synchronous version – useful for manual re-processing from the controller.
     *
     * @param inboxItemId id of the InboxItem to process
     */
    void process(UUID inboxItemId);

    /**
     * Unified "Procesar" action that replaces the old approve/reject flow.
     *
     * Orchestrates three decoupled steps:
     * <ol>
     * <li><strong>Auto-approve</strong>: creates a Note from the stored
     * classification (proposalsJson) — equivalent to the old approve().</li>
     * <li><strong>Markdown generation</strong>: calls the AI to produce a
     * clean .md document from the raw content + metadata.</li>
     * <li><strong>Suggestion analysis</strong>: inspects the content and
     * returns context-aware, actionable suggestions (decoupled from
     * the markdown step).</li>
     * </ol>
     *
     * The item status is set to PROCESSED after step 1.
     *
     * @param inboxItemId id of the InboxItem to process
     * @return a combined result containing the updated item, classification,
     *         markdown and suggestions
     */
    ProcessResultDto processItem(UUID inboxItemId);

    /**
     * Synchronous processing that participates in the caller's existing
     * transaction (propagation = REQUIRED). Use this when the InboxItem
     * has just been saved but not yet committed — e.g. inside capture().
     *
     * @param inboxItemId id of the InboxItem to process
     */
    void processInCurrentTransaction(UUID inboxItemId);

    /**
     * Generates a well-structured Markdown document from the inbox item's rawText
     * and its existing AI classification (proposalsJson).
     * The item status is NOT changed – this is a non-destructive read + AI call.
     *
     * @param inboxItemId id of the InboxItem
     * @return Markdown string
     */
    String generateMarkdown(UUID inboxItemId);
}
