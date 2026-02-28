import { useState, useEffect, useCallback } from 'react';
import { InboxItem, CreateInboxItemRequest } from '../types/inbox.types';
import { inboxService } from '../services/inboxService';

export function useInbox() {
    const [pendingItems, setPendingItems] = useState<InboxItem[]>([]);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPending = useCallback(async () => {
        try {
            setLoading(true);
            const [items, count] = await Promise.all([
                inboxService.findByStatus('PENDING'),
                inboxService.countPending(),
            ]);
            setPendingItems(items);
            setPendingCount(count);
        } catch (e) {
            setError('Error al cargar el inbox');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPending();
    }, [loadPending]);

    const capture = useCallback(async (request: CreateInboxItemRequest) => {
        try {
            setSubmitting(true);
            await inboxService.create(request);
            await loadPending();
        } catch (e) {
            setError('Error al guardar el elemento');
            throw e;
        } finally {
            setSubmitting(false);
        }
    }, [loadPending]);

    const dismiss = useCallback(async (id: string) => {
        try {
            await inboxService.markProcessed(id);
            await loadPending();
        } catch (e) {
            setError('Error al procesar el elemento');
        }
    }, [loadPending]);

    const remove = useCallback(async (id: string) => {
        try {
            await inboxService.delete(id);
            await loadPending();
        } catch (e) {
            setError('Error al eliminar el elemento');
        }
    }, [loadPending]);

    return {
        pendingItems,
        pendingCount,
        loading,
        submitting,
        error,
        capture,
        dismiss,
        remove,
        refresh: loadPending,
    };
}
