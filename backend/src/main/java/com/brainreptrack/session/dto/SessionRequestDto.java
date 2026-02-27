package com.brainreptrack.session.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SessionRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Topic ID is required")
    private Long topicId;

    @NotNull(message = "Repetitions count is required")
    @Min(value = 1, message = "Repetitions must be at least 1")
    private Integer repetitions;

    private String notes;
}
