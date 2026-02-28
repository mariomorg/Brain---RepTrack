package com.brainreptrack.inbox.service;

import com.brainreptrack.inbox.domain.ContentType;
import com.brainreptrack.inbox.domain.InboxItem;
import com.brainreptrack.inbox.dto.CaptureRequestDto;
import com.brainreptrack.inbox.dto.InboxItemRequestDto;
import com.brainreptrack.inbox.dto.InboxItemResponseDto;
import com.brainreptrack.inbox.repository.InboxItemRepository;
import com.brainreptrack.inbox.client.TranscriptionClient;
import com.brainreptrack.processing.dto.ProcessResultDto;
import com.brainreptrack.processing.service.AiProcessingService;
import com.brainreptrack.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InboxItemServiceImpl implements InboxItemService {

    private final InboxItemRepository repository;
    private final AiProcessingService aiProcessingService;
    private final ContentTypeDetector contentTypeDetector;
    private final TranscriptionClient transcriptionClient;
    private final ObjectMapper objectMapper;

    // -------------------------------------------------------
    // Unified capture — single entry point for all content types
    // -------------------------------------------------------

    @Override
    public InboxItemResponseDto capture(CaptureRequestDto dto) {
        // 1. Auto-detect content type
        ContentType detected = contentTypeDetector.detect(dto.getContent(), dto.getContentType());
        log.info("[Capture] Content type detected: {} for input hint={}", detected, dto.getContentType());

        // 2. Extract sourceUrl if content is a URL and sourceUrl not provided
        String sourceUrl = dto.getSourceUrl();
        if (sourceUrl == null && (detected == ContentType.LINK || detected == ContentType.VIDEO_REF
                || detected == ContentType.ARTICLE_REF)) {
            sourceUrl = extractUrl(dto.getContent());
        }

        // 3. Serialize metadata map to JSON
        String metadataJson = null;
        if (dto.getMetadata() != null && !dto.getMetadata().isEmpty()) {
            try {
                metadataJson = objectMapper.writeValueAsString(dto.getMetadata());
            } catch (JsonProcessingException e) {
                log.warn("[Capture] Could not serialize metadata: {}", e.getMessage());
            }
        }

        // 4. Prepend title if provided
        String rawText = dto.getContent();
        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            rawText = dto.getTitle().trim() + "\n" + rawText;
        }

        // 4b. VIDEO_REF: fetch video title so it displays nicely instead of raw URL
        if (detected == ContentType.VIDEO_REF && sourceUrl != null) {
            try {
                String videoTitle = transcriptionClient.getVideoTitle(sourceUrl);
                if (videoTitle != null && !videoTitle.equals(sourceUrl)) {
                    rawText = videoTitle + "\n" + rawText;
                    log.info("[Capture] Video title fetched: '{}'", videoTitle);
                }
            } catch (Exception e) {
                log.warn("[Capture] Could not fetch video title: {}", e.getMessage());
            }
        }

        // 5. Build and save the entity
        InboxItem entity = InboxItem.builder()
                .rawText(rawText)
                .detectedType(detected.name())
                .sourceUrl(sourceUrl)
                .metadata(metadataJson)
                .filePath(dto.getFilePath())
                .status("PENDING")
                .build();
        InboxItem saved = repository.save(entity);

        // 6. Schedule async AI processing after commit
        UUID savedId = saved.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                aiProcessingService.processAsync(savedId);
            }
        });

        log.info("[Capture] Saved InboxItem {} (type={}, sourceUrl={})",
                saved.getId(), detected, sourceUrl);
        return toDto(saved);
    }

    /** Extracts the first URL found in a text block. */
    private String extractUrl(String text) {
        if (text == null)
            return null;
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("https?://[^\\s)]+")
                .matcher(text);
        return m.find() ? m.group() : null;
    }

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
                .sourceUrl(e.getSourceUrl())
                .metadata(e.getMetadata())
                .aiSummary(e.getAiSummary())
                .createdAt(e.getCreatedAt())
                .processedAt(e.getProcessedAt())
                .build();
    }
}
