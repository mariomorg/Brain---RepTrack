import apiClient from '@shared/api/apiClient';
import { ApiResponse } from '@shared/types/common.types';
import {
    InboxItem,
    CreateInboxItemRequest,
    UpdateInboxItemRequest,
} from '../types/inbox.types';

const BASE = '/inbox';

export const inboxService = {
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

    approve: async (id: string): Promise<InboxItem> => {
        const res = await apiClient.post<ApiResponse<InboxItem>>(`${BASE}/${id}/approve`);
        return res.data.data;
    },

    reject: async (id: string): Promise<InboxItem> => {
        const res = await apiClient.post<ApiResponse<InboxItem>>(`${BASE}/${id}/reject`);
        return res.data.data;
    },
};
