import { useState, useEffect, useCallback } from 'react';
import { InboxItem, CreateInboxItemRequest } from '../types/inbox.types';
import { inboxService } from '../services/inboxService';

const POLL_INTERVAL_MS = 3000; // poll while PENDING/PROCESSING items exist

export function useInbox() {
    const [pendingItems, setPendingItems] = useState<InboxItem[]>([]);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadPending = useCallback(async () => {
        try {
            setLoading(true);
            const [pending, processing, awaitingApproval] = await Promise.all([
                inboxService.findByStatus('PENDING'),
                inboxService.findByStatus('PROCESSING'),
                inboxService.findByStatus('AWAITING_APPROVAL'),
            ]);
            // Merge and sort by creation date (newest first)
            const all = [...pending, ...processing, ...awaitingApproval]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPendingItems(all);
            setPendingCount(all.length);
        } catch (e) {
            setError('Error al cargar el inbox');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPending();
    }, [loadPending]);

    // Poll every POLL_INTERVAL_MS only while items are being AI-processed.
    // Items in AWAITING_APPROVAL pause here — they wait for user action.
    useEffect(() => {
        const hasActiveItems = pendingItems.some(
            item => item.status === 'PENDING' || item.status === 'PROCESSING'
        );
        if (!hasActiveItems) return;
        const id = setInterval(loadPending, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [pendingItems, loadPending]);

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

    const approve = useCallback(async (id: string) => {
        try {
            await inboxService.approve(id);
            await loadPending();
        } catch (e) {
            setError('Error al aprobar el elemento');
        }
    }, [loadPending]);

    const reject = useCallback(async (id: string) => {
        try {
            await inboxService.reject(id);
            await loadPending();
        } catch (e) {
            setError('Error al rechazar el elemento');
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
        approve,
        reject,
        refresh: loadPending,
    };
}
