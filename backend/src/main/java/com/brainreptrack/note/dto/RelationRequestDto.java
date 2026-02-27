package com.brainreptrack.note.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RelationRequestDto {

    @NotNull(message = "noteAId must not be null")
    private UUID noteAId;

    @NotNull(message = "noteBId must not be null")
    private UUID noteBId;

    private Double score = 0.0;

    private Boolean validated = false;
}
