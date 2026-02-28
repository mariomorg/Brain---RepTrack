import { useCerebro } from '../hooks/useCerebro';
import { NoteCard } from './NoteCard';
import { TagFilter } from './TagFilter';

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const FilterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

export default function CerebroPage() {
    const {
        filteredNotes,
        notes,
        tags,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        activeTag,
        selectTag,
    } = useCerebro();

    return (
        <div className="cerebro-page">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 className="page-header__title">Cerebro Digital</h1>
                <p className="page-header__subtitle">Conocimiento estructurado y listo para usar.</p>
            </div>

            {/* Toolbar */}
            <div className="cerebro-toolbar">
                <div className="search-bar">
                    <span className="search-bar__icon"><SearchIcon /></span>
                    <input
                        className="search-bar__input"
                        type="text"
                        placeholder="Buscar conocimiento..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="icon-btn" title="Filtrar">
                    <FilterIcon />
                </button>
            </div>

            {/* Tag filter */}
            {tags.length > 0 && (
                <TagFilter
                    tags={tags}
                    activeTag={activeTag}
                    totalCount={notes.length}
                    onSelect={selectTag}
                />
            )}

            {/* Content */}
            {loading ? (
                <div className="loading-spinner">Cargando cerebro…</div>
            ) : error ? (
                <div className="empty-state">
                    <div className="empty-state__icon">⚠️</div>
                    <p className="empty-state__text">{error}</p>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🧠</div>
                    <p className="empty-state__text">
                        {searchQuery || activeTag
                            ? 'No se encontraron notas con ese filtro.'
                            : 'Sin notas todavía. ¡Empieza capturando ideas desde el Inbox!'}
                    </p>
                </div>
            ) : (
                <div className="notes-grid">
                    {filteredNotes.map((note) => (
                        <NoteCard key={note.id} note={note} />
                    ))}
                </div>
            )}
        </div>
    );
}
