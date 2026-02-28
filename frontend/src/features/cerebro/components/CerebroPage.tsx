import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCerebro } from '../hooks/useCerebro';
import { NoteCard } from './NoteCard';
import { TagFilter } from './TagFilter';
import { FolderView } from './FolderView';

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function CerebroPage() {
  const [searchParams] = useSearchParams();
  const {
    filteredNotes,
    allFilteredNotes,
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
  const [viewMode, setViewMode] = useState<'grid' | 'folders'>('grid');

  const navigate = useNavigate();

  // Pre-fill search from URL param (e.g. navigating from Inbox carousel)
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setInputValue(searchFromUrl);
      setSearchQuery(searchFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplanar tags jerárquicas en segmentos individuales para el autocompletado
  const flatTagSegments = useMemo(() => {
    const seen = new Set<string>();
    for (const tag of tags) {
      const raw = tag.startsWith('#') ? tag.slice(1) : tag;
      for (const seg of raw.split('/').filter(Boolean)) {
        seen.add(seg);
      }
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [tags]);

  // Filtrar tags para autocompletado
  const filteredTagSuggestions = flatTagSegments.filter(
    (seg) =>
      seg.toLowerCase().includes(tagQuery.toLowerCase()) &&
      !activeTags.includes(seg)
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
        <p className="page-header__subtitle">
          Conocimiento estructurado y listo para usar.
        </p>
      </div>

      <div className="cerebro-search-container">
        <div className="search-bar-wrapper">
          <div className="search-bar">
            <span className="search-bar__icon">
              <SearchIcon />
            </span>
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
              {filteredTagSuggestions.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  className="tag-autocomplete-item"
                  onClick={() => selectTagFromSearch(tag)}
                  type="button"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sort-options">
          <button
            className={`sort-option ${
              sortBy === 'newest' || sortBy === 'oldest' ? 'active' : ''
            }`}
            onClick={() => {
              if (sortBy === 'newest') {
                setSortBy('oldest');
              } else if (sortBy === 'oldest') {
                setSortBy('none');
              } else {
                setSortBy('newest');
              }
            }}
            title={
              sortBy === 'oldest' ? 'Más antiguos primero' : 'Más recientes primero'
            }
            type="button"
          >
            {sortBy === 'oldest' ? 'Recientes ↓' : 'Recientes ↑'}
          </button>

          <button
            className={`sort-option ${
              sortBy === 'alphabetical' || sortBy === 'alphabetical-reverse'
                ? 'active'
                : ''
            }`}
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
            type="button"
          >
            {sortBy === 'alphabetical-reverse' ? 'Z↓A' : 'A↑Z'}
          </button>

          {/* View mode toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Vista en cuadrícula"
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'folders' ? 'active' : ''}`}
              onClick={() => setViewMode('folders')}
              title="Vista por carpetas"
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
            </button>
          </div>
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
      {loading && <div className="loading-spinner">Cargando cerebro…</div>}

      {!loading && error && (
        <div className="empty-state">
          <div className="empty-state__icon">⚠️</div>
          <p className="empty-state__text">{error}</p>
        </div>
      )}

      {!loading && !error && allFilteredNotes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🧠</div>
          <p className="empty-state__text">
            {searchQuery || activeTags.length > 0
              ? 'No se encontraron notas con ese filtro.'
              : 'Sin notas todavía. ¡Empieza capturando ideas desde el Inbox!'}
          </p>
        </div>
      )}

      {!loading && !error && allFilteredNotes.length > 0 && (
        <>
          {/* ── Folder view ──────────────────────────────── */}
          {viewMode === 'folders' && (
            <FolderView notes={allFilteredNotes} />
          )}

          {/* ── Grid view ────────────────────────────────── */}
          {viewMode === 'grid' && (
            <>
              <div className="notes-grid">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/recurso/${note.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        navigate(`/recurso/${note.id}`);
                    }}
                    style={{ cursor: 'pointer' }}
                    aria-label={`Ver detalles de ${note.title}`}
                  >
                    <NoteCard note={note} />
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    type="button"
                  >
                    ← Anterior
                  </button>

                  <div className="pagination-info">
                    Página {currentPage} de {totalPages} ({totalItems} notas)
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    type="button"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}