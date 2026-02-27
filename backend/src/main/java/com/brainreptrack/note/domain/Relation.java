package com.brainreptrack.note.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "relations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Relation {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    /** Source note */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_a", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Note noteA;

    /** Target note */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_b", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Note noteB;

    @Column(nullable = false)
    @Builder.Default
    private Double score = 0.0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean validated = false;
}

