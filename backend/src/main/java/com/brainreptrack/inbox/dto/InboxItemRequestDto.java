package com.brainreptrack.inbox.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InboxItemRequestDto {

    @NotBlank(message = "rawText must not be blank")
    private String rawText;

    private String detectedType;

    private String status;

    private String proposalsJson;

    private String finalJson;

    private String outputPath;
}
