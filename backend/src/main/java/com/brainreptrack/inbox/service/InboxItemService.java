package com.brainreptrack.inbox.service;

import com.brainreptrack.inbox.dto.CaptureRequestDto;
import com.brainreptrack.inbox.dto.InboxItemRequestDto;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;
import com.brainreptrack.processing.dto.ProcessResultDto;

import java.util.List;
import java.util.UUID;

public interface InboxItemService {

    /**
     * Unified capture entry point — accepts any content type.
     * Auto-detects content type when not provided by the caller.
     */
    InboxItemResponseDto capture(CaptureRequestDto dto);

    InboxItemResponseDto create(InboxItemRequestDto dto);

    InboxItemResponseDto findById(UUID id);

    List<InboxItemResponseDto> findAll();

    List<InboxItemResponseDto> findByStatus(String status);

    InboxItemResponseDto update(UUID id, InboxItemRequestDto dto);

    void delete(UUID id);

    long countPending();

    /**
     * Triggers synchronous AI processing for the given inbox item.
     * Sets status PROCESSING → calls AI → stores proposals_json →
     * AWAITING_APPROVAL.
     */
    InboxItemResponseDto process(UUID id);

    /**
     * Unified "Procesar" action — replaces old approve/reject flow.
     * Creates Note + generates Markdown + analyses suggestions.
     *
     * @return combined result with item, classification, markdown, suggestions
     */
    ProcessResultDto processItem(UUID id);

    /**
     * Generates a Markdown document from the item's rawText + existing AI
     * proposals, saves it as a .md file on disk, and stores the file path
     * in the item's outputPath field.
     *
     * @return absolute path of the saved .md file
     */
    String createMarkdown(UUID id);
}
