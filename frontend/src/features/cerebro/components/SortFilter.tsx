import { SortOption } from '../hooks/useCerebro';

interface SortFilterProps {
    sortBy: SortOption;
    onSortChange: (sort: SortOption) => void;
}

export function SortFilter({ sortBy, onSortChange }: SortFilterProps) {
    return (
        <div className="sort-filter">
            <label className="sort-filter__label">Ordenar por:</label>
            <div className="sort-filter__options">
                <button
                    className={`sort-filter__btn ${sortBy === 'newest' ? 'active' : ''}`}
                    onClick={() => onSortChange('newest')}
                >
                    Más recientes
                </button>
                <button
                    className={`sort-filter__btn ${sortBy === 'oldest' ? 'active' : ''}`}
                    onClick={() => onSortChange('oldest')}
                >
                    Más antiguos
                </button>
                <button
                    className={`sort-filter__btn ${sortBy === 'alphabetical' ? 'active' : ''}`}
                    onClick={() => onSortChange('alphabetical')}
                >
                    A-Z
                </button>
            </div>
        </div>
    );
}
