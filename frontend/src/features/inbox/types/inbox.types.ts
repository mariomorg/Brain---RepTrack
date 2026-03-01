export type InboxStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'AWAITING_APPROVAL' | 'REJECTED' | 'ARCHIVED';

export type InboxDetectedType =
    | 'TEXT'
    | 'LINK'
    | 'IDEA'
    | 'VOICE_NOTE'
    | 'CODE'
    | 'VIDEO_REF'
    | 'ARTICLE_REF'
    | 'FILE'
    | 'AUDIO'
    | 'BROWSER_EXTENSION';

export interface InboxItem {
    id: string;
    rawText: string;
    detectedType: InboxDetectedType | null;
    status: InboxStatus;
    proposalsJson: string | null;
    finalJson: string | null;
    outputPath: string | null;
    sourceUrl: string | null;
    metadata: string | null;
    aiSummary: string | null;
    /** JSON string: CalendarEvent | null */
    calendarEvent: string | null;
    createdAt: string;
    processedAt: string | null;
}

export interface CreateInboxItemRequest {
    rawText: string;
    detectedType?: string | null;
    status?: string;
}

/** Unified capture request — single entry point for all content types. */
export interface CaptureRequest {
    content: string;
    contentType?: string;
    sourceUrl?: string;
    title?: string;
    metadata?: Record<string, string>;
}

export interface UpdateInboxItemRequest {
    rawText?: string;
    detectedType?: string;
    status?: string;
    proposalsJson?: string;
    finalJson?: string;
    outputPath?: string;
}

/* ─── Suggestion types returned by the backend ─── */

export type SuggestionType =
    | 'SUMMARIZE'
    | 'REFORMULATE'
    | 'TRANSCRIBE'
    | 'OCR'
    | 'URL_EXTRACT'
    | 'RELATIONS'
    | 'CODE_FORMAT'
    | 'VIDEO_EXTRACT';

export interface SuggestionDto {
    type: SuggestionType;
    label: string;
    description: string;
    confidence: number;
    actionable: boolean;
}

/* ─── Classification structures (mirroring backend AiAnalysisResult) ─── */

export interface ClasificacionItem {
    nivel: number;
    etiqueta: string;
    confianza: number;
}

export interface AiClassification {
    clasificacion?: ClasificacionItem[];
    clasificacion_final_valida?: boolean;
    motivo?: string;
    rationale?: string;
    paths?: Array<{ path: string; confidence: number }>;
}

/* ─── Calendar event extracted by the AI ─── */

export type CalendarEventType = 'DATE_EVENT' | 'NONE';

export interface CalendarEvent {
    inboxItemId: string;
    rawText: string;
    type: CalendarEventType;
    /** ISO-8601 date string (YYYY-MM-DD), or null */
    date: string | null;
    /** 24-h time (HH:MM), or null */
    time: string | null;
    title: string | null;
    description: string | null;
    /** ISO-8601 creation timestamp */
    createdAt: string | null;
}

/* ─── Combined result from POST /procesar ─── */

export interface ProcessResult {
    item: InboxItem;
    classification: AiClassification | null;
    markdown: string;
    aiSummary: string | null;
    suggestions: SuggestionDto[];
}
