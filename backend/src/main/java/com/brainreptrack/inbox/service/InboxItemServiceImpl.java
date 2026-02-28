package com.brainreptrack.inbox.service;

import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.dto.InboxItemRequestDto;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.processing.dto.ProcessResultDto;
import com.brainreptrack.processing.service.AiProcessingService;
import com.brainreptrack.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InboxItemServiceImpl implements InboxItemService {

    private final InboxItemRepository repository;
    private final AiProcessingService aiProcessingService;

    @Override
    public InboxItemResponseDto create(InboxItemRequestDto dto) {
        InboxItem entity = InboxItem.builder()
                .rawText(dto.getRawText())
                .detectedType(dto.getDetectedType())
                .status(dto.getStatus() != null ? dto.getStatus() : "PENDING")
                .proposalsJson(dto.getProposalsJson())
                .finalJson(dto.getFinalJson())
                .outputPath(dto.getOutputPath())
                .build();
        InboxItem saved = repository.save(entity);
        // Schedule async AI analysis to run AFTER this transaction commits,
        // so the row is visible to the background thread when it queries the DB.
        UUID savedId = saved.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                aiProcessingService.processAsync(savedId);
            }
        });
        return toDto(saved);
    }

    @Override
    public InboxItemResponseDto process(UUID id) {
        findOrThrow(id);
        aiProcessingService.process(id);
        return toDto(findOrThrow(id));
    }

    @Override
    public ProcessResultDto processItem(UUID id) {
        findOrThrow(id);
        return aiProcessingService.processItem(id);
    }

    @Override
    public String createMarkdown(UUID id) {
        findOrThrow(id); // ensures the item exists
        return aiProcessingService.generateMarkdown(id);
    }

    @Override
    @Transactional(readOnly = true)
    public InboxItemResponseDto findById(UUID id) {
        return toDto(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InboxItemResponseDto> findAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InboxItemResponseDto> findByStatus(String status) {
        return repository.findByStatus(status).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public InboxItemResponseDto update(UUID id, InboxItemRequestDto dto) {
        InboxItem entity = findOrThrow(id);
        if (dto.getRawText() != null)
            entity.setRawText(dto.getRawText());
        if (dto.getDetectedType() != null)
            entity.setDetectedType(dto.getDetectedType());
        if (dto.getStatus() != null)
            entity.setStatus(dto.getStatus());
        if (dto.getProposalsJson() != null)
            entity.setProposalsJson(dto.getProposalsJson());
        if (dto.getFinalJson() != null)
            entity.setFinalJson(dto.getFinalJson());
        if (dto.getOutputPath() != null)
            entity.setOutputPath(dto.getOutputPath());
        // mark as processed when status changes away from PENDING
        if (dto.getStatus() != null && !"PENDING".equals(dto.getStatus()) && entity.getProcessedAt() == null) {
            entity.setProcessedAt(LocalDateTime.now());
        }
        return toDto(repository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        findOrThrow(id);
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long countPending() {
        return repository.countByStatus("PENDING");
    }

    // -------------------------------------------------------

    private InboxItem findOrThrow(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InboxItem", id));
    }

    private InboxItemResponseDto toDto(InboxItem e) {
        return InboxItemResponseDto.builder()
                .id(e.getId())
                .rawText(e.getRawText())
                .detectedType(e.getDetectedType())
                .status(e.getStatus())
                .proposalsJson(e.getProposalsJson())
                .finalJson(e.getFinalJson())
                .outputPath(e.getOutputPath())
                .createdAt(e.getCreatedAt())
                .processedAt(e.getProcessedAt())
                .build();
    }
}
