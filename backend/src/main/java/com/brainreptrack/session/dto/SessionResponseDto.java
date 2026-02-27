package com.brainreptrack.session.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponseDto {

    private Long id;
    private Long userId;
    private String username;
    private Long topicId;
    private String topicTitle;
    private Integer repetitions;
    private String notes;
    private LocalDateTime sessionDate;
}
