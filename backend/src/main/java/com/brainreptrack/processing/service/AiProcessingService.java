package com.brainreptrack.processing.service;

import java.util.UUID;
import java.util.concurrent.Future;

public interface AiProcessingService {

    /**
     * Asynchronously analyses the inbox item with the given id.
     *
     * The method:
     * 1. Sets the item status → PROCESSING
     * 2. Calls the Ollama AI
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
     * Creates the Note from the stored proposals_json and marks the item PROCESSED.
     * Called when the user approves the AI classification result.
     *
     * @param inboxItemId id of the InboxItem to approve
     */
    void approve(UUID inboxItemId);
}
