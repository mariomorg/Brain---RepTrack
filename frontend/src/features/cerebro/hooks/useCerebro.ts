import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Note } from '../types/note.types';
import { noteService } from '../services/noteService';
import { inboxService } from '@features/inbox/services/inboxService';

const CEREBRO_POLL_MS = 4000; // poll while inbox has PENDING/PROCESSING items

export function useCerebro() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [activePathPrefix, setActivePathPrefix] = useState<string | null>(null);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = useCallback(() => {
        if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const loadData = useCallback(async (quiet = false) => {
        try {
            if (!quiet) setLoading(true);
            const [allNotes, allTags, pendingCount, processingItems] = await Promise.all([
                noteService.findAll(),
                noteService.getAllTags(),
                inboxService.countPending(),
                inboxService.findByStatus('PROCESSING'),
            ]);
            setNotes(allNotes);
            setTags(allTags);

            // Auto-poll while the inbox has any PENDING or PROCESSING items.
            const hasActiveWork = pendingCount > 0 || processingItems.length > 0;
            if (hasActiveWork) {
                if (pollRef.current === null) {
                    pollRef.current = setInterval(() => loadData(true), CEREBRO_POLL_MS);
                }
            } else {
                stopPolling();
            }
        } catch (e) {
            setError('Error al cargar el cerebro');
        } finally {
            if (!quiet) setLoading(false);
        }
    }, [stopPolling]);

    // Load on mount
    useEffect(() => {
        loadData();
        return stopPolling; // cleanup on unmount
    }, [loadData, stopPolling]);

    // Refresh whenever the user switches back to this tab.
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') loadData();
        };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', () => loadData());
        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', () => loadData());
        };
    }, [loadData]);

    const filteredNotes = useMemo(() => {
        let result: Note[] = notes;

        // Filter by path prefix (tree selection)
        if (activePathPrefix) {
            result = result.filter(
                (n: Note) =>
                    n.path === activePathPrefix ||
                    n.path?.startsWith(activePathPrefix + '/')
            );
        }

        // Filter by flat tag chip
        if (activeTag) {
            result = result.filter((n: Note) => n.tags?.some((t) => t.name === activeTag));
        }

        // Filter by search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (n: Note) =>
                    n.title.toLowerCase().includes(q) ||
                    n.summary?.toLowerCase().includes(q) ||
                    n.tags?.some((t) => t.name.toLowerCase().includes(q))
            );
        }
        return result;
    }, [notes, activeTag, activePathPrefix, searchQuery]);

    const selectTag = useCallback((tag: string | null) => {
        setActiveTag(tag);
        setActivePathPrefix(null); // clear tree when using flat chips
    }, []);

    const selectPathPrefix = useCallback((prefix: string | null) => {
        setActivePathPrefix(prefix);
        setActiveTag(null); // clear flat chips when using tree
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
        activePathPrefix,
        selectPathPrefix,
        refresh: loadData,
    };
}
