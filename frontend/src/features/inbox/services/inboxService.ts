import apiClient from '@shared/api/apiClient';
import { ApiResponse } from '@shared/types/common.types';
import {
    InboxItem,
    CreateInboxItemRequest,
    UpdateInboxItemRequest,
    ProcessResult,
    CaptureRequest,
    CalendarEvent,
} from '../types/inbox.types';

const BASE = '/inbox';

export const inboxService = {
    /**
     * Unified capture — single entry point for any content type.
     * Content type is auto-detected when not specified.
     */
    capture: async (data: CaptureRequest): Promise<InboxItem> => {
        const res = await apiClient.post<ApiResponse<InboxItem>>(`${BASE}/capture`, data);
        return res.data.data;
    },

    /**
     * Upload a file (PDF, TXT, etc.) — the backend extracts text content
     * and processes it through the AI pipeline.
     */
    captureFile: async (file: File, additionalText?: string): Promise<InboxItem> => {
        const formData = new FormData();
        formData.append('file', file);
        if (additionalText) {
            formData.append('text', additionalText);
        }
        const res = await apiClient.post<ApiResponse<InboxItem>>(
            `${BASE}/capture/file`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
        );
        return res.data.data;
    },

    /** @deprecated Use capture() instead */
    create: async (data: CreateInboxItemRequest): Promise<InboxItem> => {
        const res = await apiClient.post<ApiResponse<InboxItem>>(BASE, data);
        return res.data.data;
    },

    findAll: async (): Promise<InboxItem[]> => {
        const res = await apiClient.get<ApiResponse<InboxItem[]>>(BASE);
        return res.data.data;
    },

    findById: async (id: string): Promise<InboxItem> => {
        const res = await apiClient.get<ApiResponse<InboxItem>>(`${BASE}/${id}`);
        return res.data.data;
    },

    findByStatus: async (status: string): Promise<InboxItem[]> => {
        const res = await apiClient.get<ApiResponse<InboxItem[]>>(`${BASE}/status/${status}`);
        return res.data.data;
    },

    countPending: async (): Promise<number> => {
        const res = await apiClient.get<ApiResponse<number>>(`${BASE}/count/pending`);
        return res.data.data;
    },

    update: async (id: string, data: UpdateInboxItemRequest): Promise<InboxItem> => {
        const res = await apiClient.put<ApiResponse<InboxItem>>(`${BASE}/${id}`, data);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE}/${id}`);
    },

    markProcessed: async (id: string): Promise<InboxItem> => {
        return inboxService.update(id, { status: 'PROCESSED' });
    },

    /**
     * Unified "Procesar" endpoint — replaces the old approve/reject flow.
     * Creates Note + generates Markdown + analyses suggestions in one call.
     */
    procesar: async (id: string): Promise<ProcessResult> => {
        const res = await apiClient.post<ApiResponse<ProcessResult>>(`${BASE}/${id}/procesar`);
        return res.data.data;
    },

    reprocess: async (id: string): Promise<InboxItem> => {
        const res = await apiClient.post<ApiResponse<InboxItem>>(`${BASE}/${id}/process`);
        return res.data.data;
    },

    createMarkdown: async (id: string): Promise<string> => {
        const res = await apiClient.post<ApiResponse<string>>(`${BASE}/${id}/create-markdown`);
        return res.data.data;
    },

    /**
     * Returns all inbox items that contain a detected calendar event.
     */
    getCalendarEvents: async (): Promise<CalendarEvent[]> => {
        const res = await apiClient.get<ApiResponse<CalendarEvent[]>>('/calendar/events');
        return res.data.data;
    },
};
