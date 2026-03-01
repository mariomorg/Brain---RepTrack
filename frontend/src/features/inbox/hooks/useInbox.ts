import { useState, useEffect, useCallback } from 'react';
import { InboxItem, CaptureRequest, ProcessResult } from '../types/inbox.types';
import { inboxService } from '../services/inboxService';
import { useInFlight } from '../context/InFlightContext';

const MAX_PROCESSED_ITEMS = 20; // show last N processed items in inbox

export function useInbox() {
    const [pendingItems, setPendingItems] = useState<InboxItem[]>([]);
    const [processedItems, setProcessedItems] = useState<InboxItem[]>([]);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inFlight = useInFlight();

    const loadPending = useCallback(async () => {
        try {
            setLoading(true);
            const [pending, processing, awaitingApproval, processed] = await Promise.all([
                inboxService.findByStatus('PENDING'),
                inboxService.findByStatus('PROCESSING'),
                inboxService.findByStatus('AWAITING_APPROVAL'),
                inboxService.findByStatus('PROCESSED'),
            ]);
            const all = [...pending, ...processing, ...awaitingApproval]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPendingItems(all);
            setPendingCount(all.length);
            const recentProcessed = [...processed]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, MAX_PROCESSED_ITEMS);
            setProcessedItems(recentProcessed);
        } catch (e) {
            setError('Error al cargar el inbox');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPending();
    }, [loadPending]);

    // No polling needed — capture() now returns the item already classified
    // by the backend (synchronous AI analysis within the same request).

    /**
     * Unified capture — fires in the background so the user can keep sending.
     * Does NOT block: submitting stays false, the input remains usable.
     */
    const capture = useCallback((request: CaptureRequest) => {
        const flightId = inFlight.add(request.content || request.sourceUrl || 'Nuevo elemento');
        inboxService.capture(request)
            .then(() => loadPending())
            .catch(() => setError('Error al guardar el elemento'))
            .finally(() => inFlight.remove(flightId));
    }, [loadPending, inFlight]);

    /**
     * File capture — fires in the background so the user can keep sending.
     */
    const captureFile = useCallback((file: File, additionalText?: string) => {
        const flightId = inFlight.add(additionalText || file.name);
        inboxService.captureFile(file, additionalText)
            .then(() => loadPending())
            .catch(() => setError('Error al subir el archivo'))
            .finally(() => inFlight.remove(flightId));
    }, [loadPending, inFlight]);

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

    /**
     * Unified "Procesar" action — calls the new backend endpoint that
     * creates the Note, generates Markdown and returns suggestions.
     */
    const procesar = useCallback(async (id: string): Promise<ProcessResult> => {
        try {
            const result = await inboxService.procesar(id);
            await loadPending();
            return result;
        } catch (e) {
            setError('Error al procesar el elemento');
            throw e;
        }
    }, [loadPending]);

    const createMarkdown = useCallback(async (id: string): Promise<string> => {
        return inboxService.createMarkdown(id);
    }, []);

    const reprocess = useCallback(async (id: string) => {
        try {
            await inboxService.reprocess(id);
            await loadPending();
        } catch {
            setError('Error al reprocesar el elemento');
        }
    }, [loadPending]);

    return {
        pendingItems,
        processedItems,
        pendingCount,
        loading,
        submitting,
        error,
        capture,
        captureFile,
        dismiss,
        remove,
        procesar,
        createMarkdown,
        reprocess,
        refresh: loadPending,
    };
}
