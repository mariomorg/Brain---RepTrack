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
    inboxItemId?: string;
    tags?: NoteTag[];
}
