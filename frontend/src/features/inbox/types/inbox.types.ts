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
