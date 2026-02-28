interface TagFilterProps {
    tags: string[];
    activeTag: string | null;
    totalCount: number;
    onSelect: (tag: string | null) => void;
}

export function TagFilter({ tags, activeTag, totalCount, onSelect }: TagFilterProps) {
    return (
        <div className="tag-filter">
            <button
                className={`tag-pill${activeTag === null ? ' active' : ''}`}
                onClick={() => onSelect(null)}
            >
                Todo ({totalCount})
            </button>

            {tags.map((tag) => (
                <button
                    key={tag}
                    className={`tag-pill${activeTag === tag ? ' active' : ''}`}
                    onClick={() => onSelect(tag)}
                >
                    #{tag}
                </button>
            ))}
        </div>
    );
}
