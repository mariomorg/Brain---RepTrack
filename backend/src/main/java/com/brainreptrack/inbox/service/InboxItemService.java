package com.brainreptrack.inbox.service;

import com.brainreptrack.inbox.dto.InboxItemRequestDto;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;

import java.util.List;
import java.util.UUID;

public interface InboxItemService {

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
     * User approves the AI result: creates the Note and marks the item PROCESSED.
     */
    InboxItemResponseDto approve(UUID id);

    /**
     * User rejects the AI result: marks the item REJECTED without creating a Note.
     */
    InboxItemResponseDto reject(UUID id);
}
