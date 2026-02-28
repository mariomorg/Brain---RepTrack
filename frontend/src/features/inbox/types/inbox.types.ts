export type InboxStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'AWAITING_APPROVAL' | 'REJECTED' | 'ARCHIVED';

export type InboxDetectedType =
    | 'TEXT'
    | 'LINK'
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
    createdAt: string;
    processedAt: string | null;
}

export interface CreateInboxItemRequest {
    rawText: string;
    detectedType?: string | null;
    status?: string;
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
    | 'RELATIONS';

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

/* ─── Combined result from POST /procesar ─── */

export interface ProcessResult {
    item: InboxItem;
    classification: AiClassification | null;
    markdown: string;
    suggestions: SuggestionDto[];
}
