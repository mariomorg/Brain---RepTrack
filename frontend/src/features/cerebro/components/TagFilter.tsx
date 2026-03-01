import { useState, useMemo } from 'react';

interface TagFilterProps {
    tags: string[];
    activeTags: string[];
    onToggle: (tag: string) => void;
    onClear: () => void;
}

/** Explodes hierarchical tag paths into individual unique segments.
 *  e.g. ["dev/frontend/react", "dev/backend"] → ["dev","frontend","react","backend"]
 */
function flattenTagSegments(tags: string[]): string[] {
    const seen = new Set<string>();
    for (const tag of tags) {
        const raw = tag.startsWith('#') ? tag.slice(1) : tag;
        for (const seg of raw.split('/').filter(Boolean)) {
            seen.add(seg);
        }
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
}

export function TagFilter({ tags, activeTags, onToggle, onClear }: TagFilterProps) {
    const [showAll, setShowAll] = useState(false);

    const flatSegments = useMemo(() => flattenTagSegments(tags), [tags]);
    const visibleSegments = showAll ? flatSegments : flatSegments.slice(0, 16);
    const hasMore = flatSegments.length > 16;

    return (
        <div className="tag-filter">
            <div className="tag-filter__tags">
                {visibleSegments.map((seg) => {
                    const isActive = activeTags.includes(seg);
                    return (
                        <button
                            key={seg}
                            className={`tag-pill ${isActive ? 'active' : ''}`}
                            onClick={() => onToggle(seg)}
                        >
                            {isActive && <span className="tag-pill__check">✓ </span>}
                            #{seg}
                        </button>
                    );
                })}

                {hasMore && (
                    <button
                        className="tag-expand-btn"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? '↑ Menos' : `↓ +${flatSegments.length - 16} más`}
                    </button>
                )}
            </div>

            {activeTags.length > 0 && (
                <button className="tag-filter__clear" onClick={onClear}>
                    Limpiar filtros
                </button>
            )}
        </div>
    );
}
