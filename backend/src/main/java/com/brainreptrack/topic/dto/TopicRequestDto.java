package com.brainreptrack.topic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TopicRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
}
