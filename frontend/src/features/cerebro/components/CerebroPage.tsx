import { useCerebro } from '../hooks/useCerebro';
import { NoteCard } from './NoteCard';
import { TagTree } from './TagTree';

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export default function CerebroPage() {
    const {
        filteredNotes,
        notes,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        activePathPrefix,
        selectPathPrefix,
    } = useCerebro();

    return (
        <div className="cerebro-page">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 className="page-header__title">Cerebro Digital</h1>
                <p className="page-header__subtitle">Conocimiento estructurado y listo para usar.</p>
            </div>

            {/* Search */}
            <div className="cerebro-toolbar" style={{ marginBottom: 24 }}>
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
            </div>

            {/* Two-column layout: tree + notes */}
            <div className="cerebro-layout">
                {/* Tag tree sidebar */}
                {notes.length > 0 && (
                    <TagTree
                        notes={notes}
                        activePrefix={activePathPrefix}
                        onSelect={selectPathPrefix}
                    />
                )}

                {/* Notes area */}
                <div className="cerebro-content">
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
                                {searchQuery || activePathPrefix
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
            </div>
        </div>
    );
}
