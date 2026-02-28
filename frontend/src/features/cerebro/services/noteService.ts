import apiClient from '@shared/api/apiClient';
import { ApiResponse } from '@shared/types/common.types';
import { Note, CreateNoteRequest, UpdateNoteRequest } from '../types/note.types';

const BASE = '/notes';

export const noteService = {
    create: async (data: CreateNoteRequest): Promise<Note> => {
        const res = await apiClient.post<ApiResponse<Note>>(BASE, data);
        return res.data.data;
    },

    findAll: async (): Promise<Note[]> => {
        const res = await apiClient.get<ApiResponse<Note[]>>(BASE);
        return res.data.data;
    },

    findById: async (id: string): Promise<Note> => {
        const res = await apiClient.get<ApiResponse<Note>>(`${BASE}/${id}`);
        return res.data.data;
    },

    findByType: async (type: string): Promise<Note[]> => {
        const res = await apiClient.get<ApiResponse<Note[]>>(`${BASE}/type/${type}`);
        return res.data.data;
    },

    findByTag: async (tagName: string): Promise<Note[]> => {
        const res = await apiClient.get<ApiResponse<Note[]>>(`${BASE}/tag/${encodeURIComponent(tagName)}`);
        return res.data.data;
    },

    search: async (q: string): Promise<Note[]> => {
        const res = await apiClient.get<ApiResponse<Note[]>>(`${BASE}/search`, { params: { q } });
        return res.data.data;
    },

    getAllTags: async (): Promise<string[]> => {
        const res = await apiClient.get<ApiResponse<string[]>>(`${BASE}/tags`);
        return res.data.data;
    },

    update: async (id: string, data: UpdateNoteRequest): Promise<Note> => {
        const res = await apiClient.put<ApiResponse<Note>>(`${BASE}/${id}`, data);
        return res.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE}/${id}`);
    },
};
