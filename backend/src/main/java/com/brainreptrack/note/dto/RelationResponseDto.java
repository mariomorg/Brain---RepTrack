package com.brainreptrack.note.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RelationResponseDto {

    private UUID id;
    private UUID noteAId;
    private UUID noteBId;
    private Double score;
    private Boolean validated;
}
