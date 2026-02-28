package com.brainreptrack.inbox.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class InboxItemResponseDto {

    private UUID id;
    private String rawText;
    private String detectedType;
    private String status;
    private String proposalsJson;
    private String finalJson;
    private String outputPath;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
