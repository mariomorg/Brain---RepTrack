import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note } from '../types/note.types';
import { noteService } from '../services/noteService';

export function useCerebro() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [allNotes, allTags] = await Promise.all([
                noteService.findAll(),
                noteService.getAllTags(),
            ]);
            setNotes(allNotes);
            setTags(allTags);
        } catch (e) {
            setError('Error al cargar el cerebro');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    /* Client-side filtering */
    const filteredNotes = useMemo(() => {
        let result: Note[] = notes;
        if (activeTag) {
            result = result.filter((n: Note) => n.tags?.includes(activeTag));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (n: Note) =>
                    n.title.toLowerCase().includes(q) ||
                    n.summary?.toLowerCase().includes(q) ||
                    n.tags?.some((t: string) => t.toLowerCase().includes(q))
            );
        }
        return result;
    }, [notes, activeTag, searchQuery]);

    const selectTag = useCallback((tag: string | null) => {
        setActiveTag(tag);
    }, []);

    return {
        notes,
        filteredNotes,
        tags,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        activeTag,
        selectTag,
        refresh: loadData,
    };
}
