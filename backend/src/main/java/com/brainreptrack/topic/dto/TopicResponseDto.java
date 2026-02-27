package com.brainreptrack.topic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponseDto {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime createdAt;
}
