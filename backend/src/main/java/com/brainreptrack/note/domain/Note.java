package com.brainreptrack.note.domain;

import com.brainreptrack.inbox.domain.InboxItem;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

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

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inbox_item_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private InboxItem inboxItem;

    /**
     * Tags stored directly in note_tags(note_id, tag_name).
     * No separate tags table.
     */
    @ElementCollection
    @CollectionTable(
            name = "note_tags",
            joinColumns = @JoinColumn(name = "note_id")
    )
    @Column(name = "tag_name", length = 128)
    @Builder.Default
    private Set<String> tags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

