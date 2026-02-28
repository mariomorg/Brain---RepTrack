package com.brainreptrack.note.domain;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a tag in the global tag registry with an optional parent.
 *
 * Tag names are bare path segments (e.g. "comida", "verduras", "zanahoria").
 * The parent_name points to the immediately enclosing segment in the same
 * path hierarchy, so the chain comida → verduras → zanahoria is navigable.
 *
 * NOTE: the same bare name may theoretically appear in two independent paths
 * (e.g. "hardware" under "cocina" vs under "tecnologia"). In that case the
 * first insertion wins (ON CONFLICT DO NOTHING). For this knowledge-base use
 * case such collisions are uncommon and acceptable.
 */
@Entity
@Table(name = "tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag {

    /** Bare segment name, e.g. "verduras". Unique across the registry. */
    @Id
    @Column(name = "name", length = 128, nullable = false)
    private String name;

    /**
     * Name of the parent tag, or {@code null} if this is a root tag.
     * Self-referential FK is enforced at the DB level only; no JPA
     * association is mapped here to avoid lazy-loading overhead on every
     * tag lookup.
     */
    @Column(name = "parent_name", length = 128)
    private String parentName;
}
