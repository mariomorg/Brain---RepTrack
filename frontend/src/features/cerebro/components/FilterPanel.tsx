import { SortOption } from '../hooks/useCerebro';

interface FilterPanelProps {
    tags: string[];
    activeTag: string | null;
    sortBy: SortOption;
    onTagSelect: (tag: string | null) => void;
    onSortChange: (sort: SortOption) => void;
    totalCount: number;
}

export function FilterPanel({
    tags,
    activeTag,
    sortBy,
    onTagSelect,
    onSortChange,
    totalCount,
}: FilterPanelProps) {
    return (
        <div className="filter-panel">
            {/* Ordenar */}
            <div className="filter-section">
                <h3 className="filter-section__title">Ordenar por</h3>
                <div className="filter-section__options">
                    <button
                        className={`filter-option ${sortBy === 'newest' ? 'active' : ''}`}
                        onClick={() => onSortChange('newest')}
                    >
                        <span className="filter-option__icon">📅</span>
                        <span className="filter-option__label">Más recientes</span>
                    </button>
                    <button
                        className={`filter-option ${sortBy === 'oldest' ? 'active' : ''}`}
                        onClick={() => onSortChange('oldest')}
                    >
                        <span className="filter-option__icon">🕰️</span>
                        <span className="filter-option__label">Más antiguos</span>
                    </button>
                    <button
                        className={`filter-option ${sortBy === 'alphabetical' ? 'active' : ''}`}
                        onClick={() => onSortChange('alphabetical')}
                    >
                        <span className="filter-option__icon">🔤</span>
                        <span className="filter-option__label">Alfabético (A-Z)</span>
                    </button>
                </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="filter-section">
                    <h3 className="filter-section__title">
                        Etiquetas
                        {activeTag && (
                            <button
                                className="filter-section__clear"
                                onClick={() => onTagSelect(null)}
                            >
                                Limpiar
                            </button>
                        )}
                    </h3>
                    <div className="filter-section__tags">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                className={`tag-filter-btn ${activeTag === tag ? 'active' : ''}`}
                                onClick={() => onTagSelect(activeTag === tag ? null : tag)}
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Resumen */}
            <div className="filter-summary">
                <span className="filter-summary__count">{totalCount}</span>
                <span className="filter-summary__label">notas en total</span>
            </div>
        </div>
    );
}
