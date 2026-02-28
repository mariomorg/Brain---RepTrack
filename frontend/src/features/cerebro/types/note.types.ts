export type NoteType = 'TEXT' | 'LINK' | 'FILE' | 'AUDIO';

export interface NoteTag {
    name: string;
    confidenceLevel?: number | null;
}

export interface Note {
    id: string;
    title: string;
    path: string | null;
    type: NoteType | string | null;
    summary: string | null;
    createdAt: string;
    inboxItemId: string | null;
    confidenceScore: number | null;
    tags: NoteTag[];
    originalContent: string | null;
    aiSummary: string | null;
    detectedType: string | null;
    sourceUrl: string | null;
    /** Texto completo extraído del archivo (solo cuando detectedType === 'FILE'). */
    fileContent: string | null;
    /** URL relativa para ver/descargar el archivo original (/api/notes/{id}/file). */
    fileUrl: string | null;
}

export interface CreateNoteRequest {
    title: string;
    path?: string | null;
    type?: string | null;
    summary?: string | null;
    inboxItemId?: string | null;
    tags?: NoteTag[];
}

export interface UpdateNoteRequest {
    title?: string;
    path?: string;
    type?: string;
    summary?: string;
    aiSummary?: string;
    inboxItemId?: string;
    tags?: NoteTag[];
}
