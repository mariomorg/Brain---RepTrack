import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCerebro } from '../hooks/useCerebro';
import { NoteCard } from './NoteCard';
import { TagFilter } from './TagFilter';

const SearchIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

export default function CerebroPage() {
    const [searchParams] = useSearchParams();
    const {
        filteredNotes,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        tags,
        activeTags,
        toggleTag,
        clearTags,
        sortBy,
        setSortBy,
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems,
    } = useCerebro();

    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [tagQuery, setTagQuery] = useState('');
    const [inputValue, setInputValue] = useState('');

    // Pre-fill search from URL param (e.g. navigating from Inbox carousel)
    useEffect(() => {
        const searchFromUrl = searchParams.get('search');
        if (searchFromUrl) {
            setInputValue(searchFromUrl);
            setSearchQuery(searchFromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filtrar tags para autocompletado
    const filteredTagSuggestions = tags.filter(tag =>
        tag.toLowerCase().includes(tagQuery.toLowerCase()) &&
        !activeTags.includes(tag)
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // Detectar si está escribiendo un tag (empieza con #)
        const tagMatch = /#(\w*)$/.exec(value);
        if (tagMatch) {
            // Guardar solo el texto antes del #
            const textBeforeTag = value.substring(0, value.lastIndexOf('#')).trim();
            setSearchQuery(textBeforeTag);
            setTagQuery(tagMatch[1]);
            setShowTagSuggestions(true);
        } else {
            setSearchQuery(value);
            setShowTagSuggestions(false);
            setTagQuery('');
        }
    };

    const selectTagFromSearch = (tag: string) => {
        // Activar el tag y limpiar el input
        toggleTag(tag);
        setInputValue(searchQuery); // Volver al texto sin el #
        setShowTagSuggestions(false);
        setTagQuery('');
    };

    return (
        <div className="cerebro-page">
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 className="page-header__title">Cerebro Digital</h1>
                <p className="page-header__subtitle">Conocimiento estructurado y listo para usar.</p>
            </div>

            {/* Search and Sort Bar */}
            <div className="cerebro-search-container">
                <div className="search-bar-wrapper">
                    <div className="search-bar">
                        <span className="search-bar__icon"><SearchIcon /></span>
                        <input
                            className="search-bar__input"
                            type="text"
                            placeholder="Buscar conocimiento... (usa # para tags)"
                            value={inputValue}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Autocompletado de tags */}
                    {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                        <div className="tag-autocomplete">
                            {filteredTagSuggestions.slice(0, 8).map(tag => (
                                <button
                                    key={tag}
                                    className="tag-autocomplete-item"
                                    onClick={() => selectTagFromSearch(tag)}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="sort-options">
                    <button
                        className={`sort-option ${sortBy === 'newest' || sortBy === 'oldest' ? 'active' : ''}`}
                        onClick={() => {
                            if (sortBy === 'newest') {
                                setSortBy('oldest');
                            } else if (sortBy === 'oldest') {
                                setSortBy('none');
                            } else {
                                setSortBy('newest');
                            }
                        }}
                        title={sortBy === 'oldest' ? 'Más antiguos primero' : 'Más recientes primero'}
                    >
                        {sortBy === 'oldest' ? 'Recientes ↓' : 'Recientes ↑'}
                    </button>
                    <button
                        className={`sort-option ${sortBy === 'alphabetical' || sortBy === 'alphabetical-reverse' ? 'active' : ''}`}
                        onClick={() => {
                            if (sortBy === 'alphabetical') {
                                setSortBy('alphabetical-reverse');
                            } else if (sortBy === 'alphabetical-reverse') {
                                setSortBy('none');
                            } else {
                                setSortBy('alphabetical');
                            }
                        }}
                        title={sortBy === 'alphabetical-reverse' ? 'Z → A' : 'A → Z'}
                    >
                        {sortBy === 'alphabetical-reverse' ? 'Z↓A' : 'A↑Z'}
                    </button>
                </div>
            </div>

            {/* Tag filter */}
            {tags.length > 0 && (
                <TagFilter
                    tags={tags}
                    activeTags={activeTags}
                    onToggle={toggleTag}
                    onClear={clearTags}
                />
            )}

            {/* Content */}
            {(() => {
                if (loading) {
                    return <div className="loading-spinner">Cargando cerebro…</div>;
                }
                if (error) {
                    return (
                        <div className="empty-state">
                            <div className="empty-state__icon">⚠️</div>
                            <p className="empty-state__text">{error}</p>
                        </div>
                    );
                }
                if (filteredNotes.length === 0) {
                    return (
                        <div className="empty-state">
                            <div className="empty-state__icon">🧠</div>
                            <p className="empty-state__text">
                                {searchQuery || activeTags.length > 0
                                    ? 'No se encontraron notas con ese filtro.'
                                    : 'Sin notas todavía. ¡Empieza capturando ideas desde el Inbox!'}
                            </p>
                        </div>
                    );
                }
                return (
                    <>
                        <div className="notes-grid">
                            {filteredNotes.map((note) => (
                                <NoteCard key={note.id} note={note} />
                            ))}
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                >
                                    ← Anterior
                                </button>

                                <div className="pagination-info">
                                    Página {currentPage} de {totalPages} ({totalItems} notas)
                                </div>

                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </>
                );
            })()}
        </div>
    );
}
