package com.brainreptrack.inbox.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inbox_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InboxItem {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "raw_text", nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "detected_type", length = 64)
    private String detectedType;

    @Column(nullable = false, length = 32)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "proposals_json", columnDefinition = "TEXT")
    private String proposalsJson;

    @Column(name = "final_json", columnDefinition = "TEXT")
    private String finalJson;

    @Column(name = "output_path", length = 512)
    private String outputPath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
