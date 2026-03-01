import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note } from '../types/note.types';
import { noteService } from '../services/noteService';

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'alphabetical-reverse' | 'none';

/** Returns true if the note contains ANY of the active tags (or a segment of a hierarchical tag). */
function noteMatchesTags(note: Note, activeTags: string[]): boolean {
    if (activeTags.length === 0) return true;
    return activeTags.some(activeTag =>
        note.tags.some(t => {
            // Match full tag name
            if (t.name === activeTag) return true;
            // Match any segment of a hierarchical tag (e.g. "dev/frontend" matches segment "frontend")
            const segments = t.name.split('/').filter(Boolean);
            return segments.includes(activeTag);
        })
    );
}

export function useCerebro() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Cargar tags siempre
    useEffect(() => {
        noteService.getAllTags().then(setTags).catch(() => setTags([]));
    }, []);

    // Buscar notas (por texto o por tags)
    useEffect(() => {
        let cancelled = false;
        async function fetchNotes() {
            setLoading(true);
            setError(null);
            try {
                let result: Note[] = [];
                if (searchQuery.trim()) {
                    result = await noteService.search(searchQuery.trim());
                    // Si además hay tags activos, filtramos el resultado por tags
                    if (activeTags.length > 0) {
                        result = result.filter(note => noteMatchesTags(note, activeTags));
                    }
                } else if (activeTags.length > 0) {
                    // Obtener todas las notas y filtrar por tags en el cliente
                    const allNotes = await noteService.findAll();
                    result = allNotes.filter(note => noteMatchesTags(note, activeTags));
                } else {
                    result = await noteService.findAll();
                }
                if (!cancelled) setNotes(result);
            } catch (e) {
                if (!cancelled) { setError('Error al buscar notas'); }
                console.error('[useCerebro] fetchNotes error:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchNotes();
        return () => { cancelled = true; };
    }, [searchQuery, activeTags]);

    const toggleTag = useCallback((tag: string) => {
        setActiveTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    }, []);

    const clearTags = useCallback(() => {
        setActiveTags([]);
    }, []);

    // Ordenar notas según sortBy
    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                case 'alphabetical-reverse':
                    return b.title.localeCompare(a.title);
                case 'none':
                default:
                    return 0;
            }
        });
    }, [notes, sortBy]);

    // Paginación
    const totalPages = Math.ceil(sortedNotes.length / itemsPerPage);
    const paginatedNotes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedNotes.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedNotes, currentPage, itemsPerPage]);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTags, sortBy]);

    return {
        notes,
        filteredNotes: paginatedNotes,
        allFilteredNotes: sortedNotes,
        tags,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        activeTags,
        toggleTag,
        clearTags,
        sortBy,
        setSortBy,
        // Paginación
        currentPage,
        setCurrentPage,
        totalPages,
        totalItems: sortedNotes.length,
    };
}

