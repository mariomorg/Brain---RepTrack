import { useState } from 'react';

interface TagFilterProps {
    tags: string[];
    activeTags: string[];
    onToggle: (tag: string) => void;
    onClear: () => void;
}

export function TagFilter({ tags, activeTags, onToggle, onClear }: TagFilterProps) {
    const [showAll, setShowAll] = useState(false);
    
    const visibleTags = showAll ? tags : tags.slice(0, 12);
    const hasMoreTags = tags.length > 12;

    return (
        <div className="tag-filter">
            <div className="tag-filter__tags">
                {visibleTags.map((tag) => {
                    const isActive = activeTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            className={`tag-pill ${isActive ? 'active' : ''}`}
                            onClick={() => onToggle(tag)}
                        >
                            {isActive && <span className="tag-pill__check">✓ </span>}
                            #{tag}
                        </button>
                    );
                })}
                
                {hasMoreTags && (
                    <button 
                        className="tag-expand-btn"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? '↑ Menos' : `↓ +${tags.length - 12} más`}
                    </button>
                )}
            </div>

            {activeTags.length > 0 && (
                <button className="tag-filter__clear" onClick={onClear}>
                    Limpiar
                </button>
            )}
        </div>
    );
}
