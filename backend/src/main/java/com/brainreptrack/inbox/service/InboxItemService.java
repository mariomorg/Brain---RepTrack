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
}
