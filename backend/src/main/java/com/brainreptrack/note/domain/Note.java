package com.brainreptrack.note.domain;

import com.brainreptrack.inbox.domain.InboxItem;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.LinkedHashSet;

@Entity
@Table(name = "notes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Note {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 512)
    private String path;

    @Column(length = 64)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String summary;

    /** Best confidence score from the AI path proposals that led to this note. */
    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inbox_item_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private InboxItem inboxItem;

    /**
     * Tags stored directly in note_tags(note_id, tag_name, confidence_level).
     * {@code confidenceLevel} is optional (nullable).
     */
    @ElementCollection
    @CollectionTable(name = "note_tags", joinColumns = @JoinColumn(name = "note_id"))
    @Builder.Default
    private Set<NoteTag> tags = new LinkedHashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
