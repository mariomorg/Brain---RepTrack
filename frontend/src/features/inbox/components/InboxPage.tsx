import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInbox } from '../hooks/useInbox';
import { InboxItem, SuggestionDto, ProcessResult } from '../types/inbox.types';
import { TagChip } from '@shared/components/TagChip';
import { noteService } from '@features/cerebro/services/noteService';
import { Note } from '@features/cerebro/types/note.types';

/* ─────────────────────────── Icons ─────────────────────────── */
const LinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
);
const FileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);
const MicIcon = ({ active }: { active?: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);
const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
const BrainIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.85A3 3 0 016.5 9a3 3 0 012-2.83V4.5A2.5 2.5 0 019.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.85A3 3 0 0117.5 9a3 3 0 00-2-2.83V4.5A2.5 2.5 0 0014.5 2z" />
    </svg>
);
const ExtIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);
const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);
const ImageIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);
const XIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const StopIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
);
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const MarkdownIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
);
const RefreshIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
);
const SparkleIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const SummarizeIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
);

/* ─────────────────────────── Types ─────────────────────────── */
interface AttachedFile {
    id: string;
    file: File;
    preview?: string; // data URL for images
    type: 'image' | 'file' | 'audio';
}

/* ─────────────────────────── Helpers ─────────────────────────── */
function isUrl(text: string): boolean {
    try { new URL(text); return true; } catch { return false; }
}

/** Module-level helper keeps nesting depth within limits. */
function applyImagePreview(id: string, url: string, prev: AttachedFile[]): AttachedFile[] {
    return prev.map(a => (a.id === id ? { ...a, preview: url } : a));
}

function detectType(text: string, attachments: AttachedFile[]): string {
    if (attachments.some(a => a.type === 'image')) return 'FILE';
    if (attachments.some(a => a.type === 'audio')) return 'AUDIO';
    if (attachments.length > 0) return 'FILE';
    if (isUrl(text.trim())) return 'LINK';
    return 'TEXT';
}

function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'hace un momento';
    if (mins < 60) return `hace ${mins} minuto${mins > 1 ? 's' : ''}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace alrededor de ${hrs} hora${hrs > 1 ? 's' : ''}`;
    const days = Math.floor(hrs / 24);
    return `hace ${days} día${days > 1 ? 's' : ''}`;
}

function typeLabelForItem(item: InboxItem): string {
    if (item.detectedType) return item.detectedType.replace('_', ' ');
    if (isUrl(item.rawText.trim())) return 'LINK';
    return 'TEXT';
}

function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
}

/* ─────────────────────────── Link Modal ─────────────────────────── */
function LinkModal({ onInsert, onClose }: Readonly<{ onInsert: (url: string, label?: string) => void; onClose: () => void }>) {
    const [url, setUrl] = useState('');
    const [label, setLabel] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleInsert = () => {
        if (!url.trim()) return;
        const finalUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
        onInsert(finalUrl, label.trim() || undefined);
    };

    return (
        <div className="modal-backdrop">
            {/* Native button covers the backdrop – satisfies a11y, handles backdrop-click-to-close */}
            <button
                className="modal-backdrop__close"
                aria-label="Cerrar"
                tabIndex={-1}
                onClick={onClose}
            />
            <div className="modal-box">
                <div className="modal-title"><LinkIcon /> Insertar enlace</div>
                <input
                    ref={inputRef}
                    className="modal-input"
                    placeholder="https://ejemplo.com"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { handleInsert(); } else if (e.key === 'Escape') { onClose(); } }}
                />
                <input
                    className="modal-input"
                    placeholder="Texto del enlace (opcional)"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { handleInsert(); } else if (e.key === 'Escape') { onClose(); } }}
                />
                <div className="modal-actions">
                    <button className="modal-btn modal-btn--cancel" onClick={onClose}>Cancelar</button>
                    <button className="modal-btn modal-btn--confirm" onClick={handleInsert} disabled={!url.trim()}>Insertar</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────── Brain mini card ─────────────────────────── */
function BrainMiniCard({ note }: Readonly<{ note: Note }>) {
    return (
        <div className="brain-mini-card">
            <div className="brain-mini-card__type">
                <span style={{ color: note.type?.toUpperCase() === 'LINK' ? '#7C3AED' : '#059669' }}>
                    {note.type?.toUpperCase() === 'LINK' ? <LinkIcon /> : <FileIcon />}
                </span>
                {note.type ?? 'TEXT'}
            </div>
            <div className="brain-mini-card__title">{note.title}</div>
            {note.summary && <div className="brain-mini-card__summary">{note.summary}</div>}
            {note.tags && note.tags.length > 0 && (
                <div className="brain-mini-card__tags">
                    {note.tags.slice(0, 3).map((t) => <TagChip key={t.name} tag={t.name} />)}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────── Attachment preview ─────────────────────────── */
function AttachmentPreview({ attachment, onRemove }: Readonly<{ attachment: AttachedFile; onRemove: () => void }>) {
    let preview: React.ReactNode;
    if (attachment.type === 'image' && attachment.preview) {
        preview = <img src={attachment.preview} alt={attachment.file.name} className="attachment-chip__thumb" />;
    } else if (attachment.type === 'audio') {
        preview = <span className="attachment-chip__icon"><MicIcon /></span>;
    } else {
        preview = <span className="attachment-chip__icon"><FileIcon /></span>;
    }
    return (
        <div className="attachment-chip">
            {preview}
            <span className="attachment-chip__name">{attachment.file.name}</span>
            <button className="attachment-chip__remove" onClick={onRemove} title="Quitar">
                <XIcon />
            </button>
        </div>
    );
}

/* ─────────────────────────── AI Proposal helpers ─────────────────────────── */
interface AiProposal {
    clasificacion?: Array<{ nivel: number; etiqueta: string; confianza: number }>;
    clasificacion_final_valida?: boolean;
    motivo?: string;
    rationale?: string;
    paths?: Array<{ path: string; confidence: number }>;
}

function parseProposal(json: string | null): AiProposal | null {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
}

/* ─────────────────────────── Smart Suggestions (server-side) ─────────────────────────── */
function SmartSuggestions({ suggestions, onAction }: Readonly<{
    suggestions: SuggestionDto[];
    onAction: (suggestion: SuggestionDto) => void;
}>) {
    if (suggestions.length === 0) return null;

    const iconForType = (type: string): React.ReactNode => {
        switch (type) {
            case 'SUMMARIZE': return <SummarizeIcon />;
            case 'REFORMULATE': return <EditIcon />;
            case 'TRANSCRIBE': return <MicIcon />;
            case 'OCR': return <FileIcon />;
            case 'URL_EXTRACT': return <LinkIcon />;
            case 'RELATIONS': return <BrainIcon />;
            default: return <SparkleIcon />;
        }
    };

    return (
        <div className="smart-suggestions">
            <div className="smart-suggestions__label"><SparkleIcon /> Sugerencias inteligentes</div>
            <div className="smart-suggestions__chips">
                {suggestions.map(s => (
                    <button
                        key={s.type}
                        className={`suggestion-chip${s.actionable ? '' : ' suggestion-chip--disabled'}`}
                        onClick={() => onAction(s)}
                        title={s.description}
                    >
                        {iconForType(s.type)} {s.label}
                        {!s.actionable && <span className="suggestion-chip__badge">próx.</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────── Card for AWAITING_APPROVAL items — "Procesar" button ─────────────────────────── */
function PendingApprovalCard({
    item,
    onProcesar,
    onReprocess,
    onRemove,
    processing,
}: Readonly<{
    item: InboxItem;
    onProcesar: () => void;
    onReprocess: () => void;
    onRemove: () => void;
    processing: boolean;
}>) {
    const proposal = parseProposal(item.proposalsJson);
    const clasif = proposal?.clasificacion ?? [];
    const motivo = proposal?.motivo ?? proposal?.rationale ?? '';
    const pathLabel = clasif.map(c => c.etiqueta).join(' → ');
    const minConf = clasif.length > 0 ? Math.min(...clasif.map(c => c.confianza)) : null;

    // Legacy paths fallback
    const legacyPath = !clasif.length && proposal?.paths?.[0]?.path;

    return (
        <div className="inbox-item-card inbox-item-card--approval">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1 }}>
                    <div className="inbox-item__type-badge" style={{ marginBottom: 4 }}>
                        <ExtIcon />
                        {typeLabelForItem(item)}
                    </div>
                    <div className="inbox-item__text" style={{ WebkitLineClamp: 2 }}>{item.rawText}</div>
                    <div className="inbox-item__time">{formatRelativeTime(item.createdAt)}</div>
                </div>
                <button
                    className="capture-toolbar-btn"
                    title="Eliminar"
                    onClick={onRemove}
                    style={{ color: '#EF4444', flexShrink: 0 }}
                >
                    <TrashIcon />
                </button>
            </div>

            {/* AI classification result */}
            <div className="ai-proposal-box">
                <div className="ai-proposal-box__label">
                    <BrainIcon /> Propuesta de la IA
                    {minConf !== null && (
                        <span className="ai-proposal-box__conf">{minConf}% conf.</span>
                    )}
                </div>

                {pathLabel ? (
                    <div className="ai-proposal-box__path">
                        {clasif.filter(c => c.etiqueta).map((c, i) => (
                            <span key={c.nivel} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {i > 0 && <span style={{ color: 'var(--color-text-muted)', margin: '0 2px' }}>›</span>}
                                <TagChip tag={c.etiqueta} />
                            </span>
                        ))}
                    </div>
                ) : null}
                {!pathLabel && legacyPath ? (
                    <div className="ai-proposal-box__path">
                        {legacyPath.split('/').filter(Boolean).map((seg, i) => (
                            <span key={`${seg}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                {i > 0 && <span style={{ color: 'var(--color-text-muted)', margin: '0 2px' }}>›</span>}
                                <TagChip tag={seg} />
                            </span>
                        ))}
                    </div>
                ) : null}
                {!pathLabel && !legacyPath ? (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 12, fontStyle: 'italic' }}>
                        Sin clasificación definida
                    </div>
                ) : null}

                {motivo && (
                    <div className="ai-proposal-box__motivo">{motivo}</div>
                )}
            </div>

            {/* Action buttons — single "Procesar" replaces approve/reject */}
            <div className="ai-proposal-actions">
                <button
                    className="ai-action-btn ai-action-btn--procesar"
                    onClick={onProcesar}
                    disabled={processing}
                >
                    {processing ? (
                        <><BrainIcon /> Procesando…</>
                    ) : (
                        <><CheckIcon /> Procesar</>
                    )}
                </button>
            </div>
            <div style={{ marginTop: 6 }}>
                <button className="ai-action-btn ai-action-btn--reprocess" style={{ width: '100%' }} onClick={onReprocess} disabled={processing}>
                    <RefreshIcon /> Reprocesar
                </button>
            </div>
        </div>
    );
}

/* ─────────────────────────── Processed card (shows result + suggestions) ─────────────────────────── */
function ProcessedCard({
    item,
    suggestions,
    onReprocess,
    onCreateMarkdown,
    onRemove,
    onSuggestion,
    creatingMarkdown,
}: Readonly<{
    item: InboxItem;
    suggestions: SuggestionDto[];
    onReprocess: () => void;
    onCreateMarkdown: () => void;
    onRemove: () => void;
    onSuggestion: (suggestion: SuggestionDto) => void;
    creatingMarkdown: boolean;
}>) {
    const proposal = parseProposal(item.proposalsJson);
    const clasif = proposal?.clasificacion ?? [];
    const motivo = proposal?.motivo ?? proposal?.rationale ?? '';
    const legacyPath = !clasif.length && proposal?.paths?.[0]?.path;
    const hasSavedFile = !!item.outputPath;

    return (
        <div className="inbox-item-card inbox-item-card--processed">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                    <div className="inbox-item__type-badge" style={{ marginBottom: 4 }}>
                        <ExtIcon /> {typeLabelForItem(item)}
                        <span className="processed-badge">PROCESADO</span>
                    </div>
                    <div className="inbox-item__text" style={{ WebkitLineClamp: 2 }}>{item.rawText}</div>
                    <div className="inbox-item__time">{formatRelativeTime(item.createdAt)}</div>
                </div>
                <button className="capture-toolbar-btn" title="Eliminar" onClick={onRemove} style={{ color: '#EF4444', flexShrink: 0 }}>
                    <TrashIcon />
                </button>
            </div>

            {/* Classification result */}
            {(clasif.length > 0 || legacyPath) && (
                <div className="ai-proposal-box" style={{ marginBottom: 8 }}>
                    <div className="ai-proposal-box__label"><BrainIcon /> Clasificación aprobada</div>
                    {clasif.length > 0 && (
                        <div className="ai-proposal-box__path">
                            {clasif.filter(c => c.etiqueta).map((c, i) => (
                                <span key={c.nivel} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    {i > 0 && <span style={{ color: 'var(--color-text-muted)', margin: '0 2px' }}>›</span>}
                                    <TagChip tag={c.etiqueta} />
                                </span>
                            ))}
                        </div>
                    )}
                    {clasif.length === 0 && legacyPath && (
                        <div className="ai-proposal-box__path">
                            {legacyPath.split('/').filter(Boolean).map((seg, i) => (
                                <span key={`${seg}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    {i > 0 && <span style={{ color: 'var(--color-text-muted)', margin: '0 2px' }}>›</span>}
                                    <TagChip tag={seg} />
                                </span>
                            ))}
                        </div>
                    )}
                    {motivo && <div className="ai-proposal-box__motivo">{motivo}</div>}
                </div>
            )}

            {/* Saved file indicator */}
            {hasSavedFile && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 10px', marginBottom: 8,
                    background: 'rgba(34,197,94,0.1)', borderRadius: 8,
                    fontSize: 12, color: '#22c55e',
                }}>
                    <MarkdownIcon /> Archivo guardado: <span style={{ color: 'var(--color-text)', wordBreak: 'break-all' }}>{item.outputPath}</span>
                </div>
            )}

            {/* Smart suggestions (server-side) */}
            <SmartSuggestions suggestions={suggestions} onAction={onSuggestion} />

            {/* Actions — no approve/reject */}
            <div className="processed-actions">
                <button
                    className="ai-action-btn ai-action-btn--markdown"
                    onClick={onCreateMarkdown}
                    disabled={creatingMarkdown}
                >
                    <MarkdownIcon /> {(() => {
                        if (creatingMarkdown) return 'Generando…';
                        if (hasSavedFile) return 'Regenerar Markdown';
                        return 'Crear Markdown';
                    })()}
                </button>
                <button className="ai-action-btn ai-action-btn--reprocess" onClick={onReprocess}>
                    <RefreshIcon /> Reprocesar
                </button>
            </div>
        </div>
    );
}

/* ─────────────────────────── Main component ─────────────────────────── */
export default function InboxPage() {
    const { pendingItems, processedItems, pendingCount, loading, submitting, capture, remove, procesar, createMarkdown, reprocess } = useInbox();
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState<AttachedFile[]>([]);
    const [recentNotes, setRecentNotes] = useState<Note[]>([]);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [carouselPaused, setCarouselPaused] = useState(false);
    // slotNotes: las 3 notas actualmente renderizadas en cada slot
    const [slotNotes, setSlotNotes] = useState<(Note | null)[]>([null, null, null]);
    // slotVisible: controla el crossfade de cada slot
    const [slotVisible, setSlotVisible] = useState([true, true, true]);
    const [isDragging, setIsDragging] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [recording, setRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    // Track process results (suggestions) per-item by id
    const [processResults, setProcessResults] = useState<Record<string, ProcessResult>>({});
    // Track which items are currently being "procesado"
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    // Track which items are currently generating markdown
    const [markdownCreatingIds, setMarkdownCreatingIds] = useState<Set<string>>(new Set());

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const navigate = useNavigate();

    /* Load recent notes */
    useEffect(() => {
        noteService.findAll()
            .then(notes => setRecentNotes(notes.slice(0, 20)))
            .catch(() => setRecentNotes([]));
    }, []);

    /* Inicializar slots cuando se cargan las notas */
    useEffect(() => {
        if (recentNotes.length === 0) return;
        setSlotNotes([
            recentNotes[0] ?? null,
            recentNotes[1] ?? null,
            recentNotes[2] ?? null,
        ]);
        setSlotVisible([true, true, true]);
    }, [recentNotes]);

    /* Avanzar: crossfade slot a slot */
    const advanceCarousel = useCallback((nextIdx?: number) => {
        const next = nextIdx ?? (carouselIndex + 1) % recentNotes.length;
        setSlotVisible([false, true, true]);
        const applyNewSlots = () => {
            setSlotNotes([
                recentNotes[next] ?? null,
                recentNotes[(next + 1) % recentNotes.length] ?? null,
                recentNotes[(next + 2) % recentNotes.length] ?? null,
            ]);
            setCarouselIndex(next);
            // 16ms = one animation frame; lets React paint the new content before fading in
            setTimeout(() => setSlotVisible([true, true, true]), 16);
        };
        setTimeout(applyNewSlots, 500);
    }, [carouselIndex, recentNotes]);

    /* Carrusel automático */
    useEffect(() => {
        if (recentNotes.length <= 3) return;
        const interval = setInterval(() => {
            if (carouselPaused) return;
            advanceCarousel();
        }, 3500);
        return () => clearInterval(interval);
    }, [recentNotes, carouselPaused, advanceCarousel]);

    /* Toast auto-dismiss */
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

    /* ── File helpers ── */
    const readImagePreview = useCallback((id: string, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            setAttachments(prev => applyImagePreview(id, url, prev));
        };
        reader.readAsDataURL(file);
    }, []);

    const addFiles = useCallback((files: File[]) => {
        const newAttachments: AttachedFile[] = [];
        for (const file of files) {
            const isImage = file.type.startsWith('image/');
            const isAudio = file.type.startsWith('audio/');
            const id = generateId();
            let attType: 'image' | 'file' | 'audio' = 'file';
            if (isImage) { attType = 'image'; }
            else if (isAudio) { attType = 'audio'; }
            const att: AttachedFile = { id, file, type: attType };
            if (isImage) { readImagePreview(id, file); }
            newAttachments.push(att);
        }
        setAttachments(prev => [...prev, ...newAttachments]);
    }, [readImagePreview]);

    const removeAttachment = (id: string) => setAttachments(prev => prev.filter(a => a.id !== id));

    /* ── Paste handler (images + text) ── */
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = Array.from(e.clipboardData.items);
        const imageItems = items.filter(i => i.type.startsWith('image/'));
        if (imageItems.length === 0) return; // let default text paste happen
        e.preventDefault();
        const files = imageItems.map(i => i.getAsFile()).filter(Boolean) as File[];
        addFiles(files);
        showToast(`${files.length} imagen${files.length > 1 ? 'es' : ''} pegada${files.length > 1 ? 's' : ''}`);
    }, [addFiles]);

    /* ── Drag & drop ── */
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) { addFiles(files); showToast(`${files.length} archivo${files.length > 1 ? 's' : ''} añadido${files.length > 1 ? 's' : ''}`); }
        // Also handle dropped text/URLs
        const droppedText = e.dataTransfer.getData('text/plain');
        if (droppedText && !files.length) setText(prev => prev ? prev + '\n' + droppedText : droppedText);
    };

    /* ── File input handlers ── */
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length) addFiles(files);
        e.target.value = '';
    };

    /* ── Link insert ── */
    const handleInsertLink = (url: string, label?: string) => {
        const insert = label ? `[${label}](${url})` : url;
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = text.slice(0, start) + insert + text.slice(end);
            setText(newText);
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + insert.length, start + insert.length);
            }, 0);
        } else {
            setText(prev => prev ? prev + ' ' + insert : insert);
        }
        setShowLinkModal(false);
        showToast('Enlace insertado');
    };

    /* ── Audio recording ── */
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mr.ondataavailable = e => audioChunksRef.current.push(e.data);
            mr.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `grabacion-${Date.now()}.webm`, { type: 'audio/webm' });
                addFiles([file]);
                stream.getTracks().forEach(t => t.stop());
                showToast('Audio guardado');
            };
            mr.start();
            mediaRecorderRef.current = mr;
            setRecording(true);
            setRecordingSeconds(0);
            recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
        } catch {
            showToast('No se pudo acceder al micrófono', 'error');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };

    const handleMicClick = () => recording ? stopRecording() : startRecording();

    /* ── Create Markdown (saves file to disk) ── */
    const handleCreateMarkdown = async (id: string) => {
        setMarkdownCreatingIds(prev => new Set(prev).add(id));
        try {
            const filePath = await createMarkdown(id);
            if (filePath) {
                showToast(`Markdown guardado: ${filePath}`);
            } else {
                showToast('Markdown generado (sin ruta de archivo)');
            }
        } catch {
            showToast('Error al generar el Markdown', 'error');
        } finally {
            setMarkdownCreatingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    /* ── Smart suggestion action (server-side) ── */
    const handleSuggestion = (suggestion: SuggestionDto) => {
        if (suggestion.actionable) {
            showToast(`Ejecutando: ${suggestion.label}…`);
            // Future: dispatch actual action based on suggestion.type
        } else {
            showToast(`${suggestion.label} — próximamente disponible.`);
        }
    };

    /* ── Procesar (unified action — replaces approve/reject) ── */
    const handleProcesar = async (id: string) => {
        setProcessingIds(prev => new Set(prev).add(id));
        try {
            const result = await procesar(id);
            setProcessResults(prev => ({ ...prev, [id]: result }));
            // The markdown file is auto-saved on the backend
            if (result.item?.outputPath) {
                showToast(`Procesado y guardado: ${result.item.outputPath}`);
            } else {
                showToast('Elemento procesado con éxito');
            }
        } catch {
            showToast('Error al procesar el elemento', 'error');
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    /* ── Send ── */
    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed && attachments.length === 0) return;

        // Build rawText: if there are files, append their names
        let rawText = trimmed;
        if (attachments.length > 0 && !rawText) {
            rawText = attachments.map(a => a.file.name).join(', ');
        } else if (attachments.length > 0) {
            rawText += '\n[Adjuntos: ' + attachments.map(a => a.file.name).join(', ') + ']';
        }

        try {
            await capture({
                rawText,
                detectedType: detectType(trimmed, attachments),
            });
            setText('');
            setAttachments([]);
            textareaRef.current?.focus();
            showToast('Guardado en el inbox ✓');
        } catch {
            showToast('Error al guardar', 'error');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const canSend = !submitting && (text.trim().length > 0 || attachments.length > 0);

    return (
        <>
            {/* ── Inline styles ── */}
            <style>{`
                .modal-backdrop {
                    position: fixed; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(4px);
                    z-index: 1000; display: flex; align-items: center; justify-content: center;
                }
                .modal-backdrop__close {
                    position: absolute; inset: 0; background: transparent; border: none; cursor: default;
                }
                .modal-box {
                    position: relative; z-index: 1;
                    background: var(--color-bg-card, #1a1a2e); border: 1px solid var(--color-border, #2d2d4a);
                    border-radius: 12px; padding: 24px; width: 400px; max-width: 92vw;
                    display: flex; flex-direction: column; gap: 12px;
                }
                .modal-title { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 15px; color: var(--color-text, #e2e8f0); }
                .modal-input {
                    width: 100%; padding: 9px 12px; border-radius: 8px; font-size: 14px;
                    border: 1px solid var(--color-border, #2d2d4a); background: var(--color-bg, #11111f);
                    color: var(--color-text, #e2e8f0); outline: none; box-sizing: border-box;
                    transition: border-color .15s;
                }
                .modal-input:focus { border-color: var(--color-accent, #6366f1); }
                .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
                .modal-btn { padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
                .modal-btn--cancel { background: var(--color-bg, #11111f); color: var(--color-text-muted, #94a3b8); border: 1px solid var(--color-border, #2d2d4a); }
                .modal-btn--confirm { background: var(--color-accent, #6366f1); color: #fff; }
                .modal-btn--confirm:disabled { opacity: .5; cursor: not-allowed; }

                .attachment-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 14px 0; }
                .attachment-chip {
                    display: flex; align-items: center; gap: 6px; padding: 4px 8px 4px 4px;
                    background: var(--color-bg-hover, rgba(99,102,241,.08)); border: 1px solid var(--color-border, #2d2d4a);
                    border-radius: 8px; font-size: 12px; max-width: 200px; color: var(--color-text, #e2e8f0);
                }
                .attachment-chip__thumb { width: 28px; height: 28px; object-fit: cover; border-radius: 4px; }
                .attachment-chip__icon { display: flex; align-items: center; width: 28px; height: 28px; justify-content: center; color: var(--color-text-muted, #94a3b8); }
                .attachment-chip__name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 110px; }
                .attachment-chip__remove { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: rgba(239,68,68,.15); color: #ef4444; border: none; cursor: pointer; flex-shrink: 0; padding: 0; }
                .attachment-chip__remove:hover { background: rgba(239,68,68,.3); }

                .drag-overlay {
                    position: absolute; inset: 0; background: rgba(99,102,241,.08); border: 2px dashed var(--color-accent, #6366f1);
                    border-radius: inherit; z-index: 5; display: flex; align-items: center; justify-content: center;
                    font-weight: 600; color: var(--color-accent, #6366f1); font-size: 15px; pointer-events: none;
                    border-radius: 12px;
                }

                .recording-badge {
                    display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 20px;
                    background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: #ef4444; font-size: 12px; font-weight: 500;
                }
                .recording-dot { width: 7px; height: 7px; border-radius: 50%; background: #ef4444; animation: blink 1s infinite; }
                @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .2 } }

                .toast {
                    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 2000;
                    padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 500;
                    box-shadow: 0 4px 24px rgba(0,0,0,.3); animation: toastIn .25s ease;
                    white-space: nowrap;
                }
                .toast--success { background: #059669; color: #fff; }
                .toast--error { background: #dc2626; color: #fff; }
                @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

                .capture-box { position: relative; }
                .capture-box--dragging .capture-box__textarea { opacity: 0.4; }

                .inbox-item__attachments { margin-top: 6px; display: flex; flex-wrap: wrap; gap: 4px; }
                .inbox-item__attach-chip {
                    display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 7px;
                    background: var(--color-bg-hover, rgba(99,102,241,.06)); border: 1px solid var(--color-border, #2d2d4a);
                    border-radius: 6px; color: var(--color-text-muted, #94a3b8);
                }

                .mic-active { color: #ef4444 !important; }

                .sidebar-scroll-indicator {
                    display: none;
                }

                /* ── Carrusel de tarjetas ── */
                .carousel-dots {
                    display: flex;
                    gap: 5px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .carousel-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    border: none;
                    background: var(--color-border);
                    cursor: pointer;
                    padding: 0;
                    transition: background 0.3s, width 0.3s, border-radius 0.3s;
                }
                .carousel-dot--active {
                    background: var(--color-primary);
                    width: 18px;
                    border-radius: 3px;
                }

                .carousel-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* Transición de opacidad pura — muy suave */
                .carousel-card {
                    transition: opacity 0.8s ease;
                    will-change: opacity;
                }
                .carousel-card--pos1 {
                    transition: opacity 0.8s ease 0.08s;
                    transform: scale(0.97);
                    transform-origin: top center;
                }
                .carousel-card--pos2 {
                    transition: opacity 0.8s ease 0.16s;
                    transform: scale(0.94);
                    transform-origin: top center;
                }

                /* ── AI Approval card ── */
                .inbox-item-card--approval {
                    border-color: rgba(99,102,241,.35);
                    background: linear-gradient(135deg, rgba(99,102,241,.05) 0%, transparent 100%);
                }
                .ai-proposal-box {
                    background: var(--color-bg, #11111f);
                    border: 1px solid var(--color-border, #2d2d4a);
                    border-radius: 8px;
                    padding: 10px 12px;
                    margin-bottom: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .ai-proposal-box__label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: .05em;
                    color: var(--color-accent, #6366f1);
                }
                .ai-proposal-box__conf {
                    margin-left: auto;
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--color-text-muted, #94a3b8);
                }
                .ai-proposal-box__path {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 4px;
                }
                .ai-proposal-box__motivo {
                    font-size: 12px;
                    color: var(--color-text-muted, #94a3b8);
                    font-style: italic;
                    line-height: 1.4;
                }
                .ai-proposal-actions {
                    display: flex;
                    gap: 8px;
                }
                .ai-action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: opacity .15s, transform .1s;
                }
                .ai-action-btn:hover { opacity: .85; transform: translateY(-1px); }
                .ai-action-btn:active { transform: translateY(0); }
                .ai-action-btn--approve { background: #059669; color: #fff; }
                .ai-action-btn--reject  { background: rgba(239,68,68,.15); color: #ef4444; border: 1px solid rgba(239,68,68,.3); }
                .ai-action-btn--reprocess { background: rgba(99,102,241,.12); color: var(--color-accent, #6366f1); border: 1px solid rgba(99,102,241,.25); }
                .ai-action-btn--markdown { background: #0891b2; color: #fff; }
                .ai-action-btn--procesar { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #fff; flex: 1; }
                .ai-action-btn--procesar:disabled { opacity: .6; cursor: wait; }

                /* ── Processed card ── */
                .inbox-item-card--processed {
                    border-color: rgba(16,185,129,.3);
                    background: linear-gradient(135deg, rgba(16,185,129,.04) 0%, transparent 100%);
                }
                .processed-badge {
                    display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 4px;
                    font-size: 9px; font-weight: 700; letter-spacing: .06em;
                    background: rgba(16,185,129,.15); color: #10b981; margin-left: 6px;
                }
                .processed-actions {
                    display: flex; gap: 8px; margin-top: 8px;
                }

                /* ── Smart suggestions ── */
                .smart-suggestions {
                    margin: 8px 0 4px;
                }
                .smart-suggestions__label {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em;
                    color: var(--color-text-muted, #94a3b8); margin-bottom: 6px;
                }
                .smart-suggestions__chips {
                    display: flex; flex-wrap: wrap; gap: 5px;
                }
                .suggestion-chip {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 4px 10px; border-radius: 20px; font-size: 11px; cursor: pointer;
                    background: var(--color-bg-hover, rgba(99,102,241,.07));
                    border: 1px solid var(--color-border, #2d2d4a);
                    color: var(--color-text, #e2e8f0);
                    transition: background .15s, border-color .15s;
                    text-align: left;
                }
                .suggestion-chip:hover { background: rgba(99,102,241,.16); border-color: rgba(99,102,241,.4); }
                .suggestion-chip--disabled { opacity: .65; cursor: default; }
                .suggestion-chip--disabled:hover { background: var(--color-bg-hover, rgba(99,102,241,.07)); border-color: var(--color-border, #2d2d4a); }
                .suggestion-chip__badge {
                    font-size: 9px; font-weight: 600; padding: 1px 5px; border-radius: 4px;
                    background: rgba(99,102,241,.15); color: var(--color-accent, #6366f1);
                    margin-left: 2px;
                }

                /* ── Markdown preview ── */
                .markdown-preview {
                    flex: 1; overflow-y: auto; margin: 12px 0;
                    background: var(--color-bg, #11111f); border: 1px solid var(--color-border, #2d2d4a);
                    border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.6;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    color: var(--color-text, #e2e8f0); white-space: pre-wrap; word-break: break-word;
                }
            `}</style>

            {/* Toast */}
            {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

            {/* Link modal */}
            {showLinkModal && <LinkModal onInsert={handleInsertLink} onClose={() => setShowLinkModal(false)} />}

            {/* Hidden file inputs */}
            <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }} onChange={handleFileInputChange} />
            <input ref={imageInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileInputChange} />

            <div className="inbox-layout">
                {/* ── Main panel ── */}
                <div className="inbox-main">
                    <div style={{ marginBottom: 24 }}>
                        <h1 className="page-header__title">Inbox Unificado</h1>
                        <p className="page-header__subtitle">
                            Captura rápida de cualquier contenido. Sin pensar, sin clasificar.
                        </p>
                    </div>

                    {/* Capture box */}
                    <section
                        aria-label="Área de captura de contenido"
                        className={`capture-box${isDragging ? ' capture-box--dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isDragging && <div className="drag-overlay">Suelta aquí para añadir</div>}

                        <textarea
                            ref={textareaRef}
                            className="capture-box__textarea"
                            placeholder="Escribe una idea, pega un enlace, arrastra archivos o pega una imagen con Ctrl+V…"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            rows={4}
                        />

                        {/* Attachments preview */}
                        {attachments.length > 0 && (
                            <div className="attachment-list">
                                {attachments.map(a => (
                                    <AttachmentPreview key={a.id} attachment={a} onRemove={() => removeAttachment(a.id)} />
                                ))}
                            </div>
                        )}

                        <div className="capture-box__toolbar">


                            {/* File button */}
                            <button
                                className="capture-toolbar-btn"
                                title="Adjuntar archivo"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FileIcon />
                            </button>

                            {/* Image button */}
                            <button
                                className="capture-toolbar-btn"
                                title="Adjuntar imagen"
                                onClick={() => imageInputRef.current?.click()}
                            >
                                <ImageIcon />
                            </button>

                            {/* Mic button */}
                            <button
                                className={`capture-toolbar-btn${recording ? ' mic-active' : ''}`}
                                title={recording ? 'Detener grabación' : 'Grabar audio'}
                                onClick={handleMicClick}
                            >
                                {recording ? <StopIcon /> : <MicIcon />}
                            </button>

                            {/* Recording badge */}
                            {recording && (
                                <span className="recording-badge">
                                    <span className="recording-dot" />
                                    {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                                </span>
                            )}

                            <div style={{ flex: 1 }} />

                            <button
                                className="capture-send-btn"
                                onClick={handleSend}
                                disabled={!canSend}
                                title="Guardar (Enter)"
                            >
                                <SendIcon />
                            </button>
                        </div>
                        <div className="capture-box__hint">
                            Enter para guardar&nbsp;•&nbsp;Arrastra archivos&nbsp;•&nbsp;Ctrl+V para pegar imágenes&nbsp;•&nbsp;Shift+Enter para nueva línea
                        </div>
                    </section>

                    <div className="pending-section__header">
                        <span className="pending-section__title">Actividad del inbox</span>
                        <span className="pending-count-badge">{pendingCount} items</span>
                    </div>

                    {(() => {
                        if (loading) {
                            return <div className="loading-spinner">Cargando…</div>;
                        }
                        if (pendingItems.length === 0 && processedItems.length === 0) {
                            return (
                                <div className="empty-state">
                                    <div className="empty-state__icon">✅</div>
                                    <p className="empty-state__text">Sin elementos pendientes. ¡Todo procesado!</p>
                                </div>
                            );
                        }
                        const awaitingItems = pendingItems.filter(i => i.status === 'AWAITING_APPROVAL');
                        const processingItems = pendingItems.filter(i => i.status !== 'AWAITING_APPROVAL');
                        return (
                            <>
                                {/* ── Items awaiting user action — "Procesar" button ── */}
                                {awaitingItems.length > 0 && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px', color: 'var(--color-accent, #6366f1)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                            <BrainIcon /> Listos para procesar
                                        </div>
                                        <div className="inbox-items-list" style={{ marginBottom: 20 }}>
                                            {awaitingItems.map(item => (
                                                <PendingApprovalCard
                                                    key={item.id}
                                                    item={item}
                                                    onProcesar={() => handleProcesar(item.id)}
                                                    onReprocess={() => { void reprocess(item.id); }}
                                                    onRemove={() => remove(item.id)}
                                                    processing={processingIds.has(item.id)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* ── Items being processed by AI ── */}
                                {processingItems.length > 0 && (
                                    <>
                                        {awaitingItems.length > 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px', color: 'var(--color-text-muted, #94a3b8)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                                Procesando
                                            </div>
                                        )}
                                        <div className="inbox-items-list">
                                            {processingItems.map(item => (
                                                <div key={item.id} className="inbox-item-card">
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div className="inbox-item__type-badge">
                                                                <ExtIcon />
                                                                {typeLabelForItem(item)}
                                                            </div>
                                                            <div className="inbox-item__text">{item.rawText}</div>
                                                            {isUrl(item.rawText.trim()) && (
                                                                <a href={item.rawText.trim()} target="_blank" rel="noopener noreferrer" className="inbox-item__link">
                                                                    {item.rawText.trim()}
                                                                </a>
                                                            )}
                                                            <div className="inbox-item__time">{formatRelativeTime(item.createdAt)}</div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                            <button
                                                                className="capture-toolbar-btn"
                                                                title="Eliminar"
                                                                onClick={() => remove(item.id)}
                                                                style={{ color: '#EF4444' }}
                                                            >
                                                                <TrashIcon />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* ── Recently processed (no approve/reject) ── */}
                                {processedItems.length > 0 && (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 8px', color: 'var(--color-text-muted, #94a3b8)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                                            <CheckIcon /> Procesados recientemente
                                        </div>
                                        <div className="inbox-items-list">
                                            {processedItems.map(item => (
                                                <ProcessedCard
                                                    key={item.id}
                                                    item={item}
                                                    suggestions={processResults[item.id]?.suggestions ?? []}
                                                    onReprocess={() => { void reprocess(item.id); }}
                                                    onCreateMarkdown={() => handleCreateMarkdown(item.id)}
                                                    onRemove={() => remove(item.id)}
                                                    onSuggestion={handleSuggestion}
                                                    creatingMarkdown={markdownCreatingIds.has(item.id)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        );
                    })()}
                </div>

                {/* ── Right sidebar ── */}
                <aside
                    className="inbox-sidebar"
                    onMouseEnter={() => setCarouselPaused(true)}
                    onMouseLeave={() => setCarouselPaused(false)}
                >
                    <div className="inbox-sidebar__title">
                        <BrainIcon />
                        Desde tu Cerebro
                        {carouselPaused && (
                            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 400 }}>
                                pausado
                            </span>
                        )}
                    </div>
                    {recentNotes.length === 0 ? (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                            Aún no hay notas en tu Cerebro.
                        </div>
                    ) : (
                        <>
                            {/* Dots indicadores */}
                            <div className="carousel-dots">
                                {recentNotes.map((note, i) => (
                                    <button
                                        key={note.id}
                                        className={`carousel-dot${i === carouselIndex ? ' carousel-dot--active' : ''}`}
                                        onClick={() => advanceCarousel(i)}
                                    />
                                ))}
                            </div>

                            {/* Carrusel de tarjetas */}
                            <div className="carousel-stack">
                                {slotNotes.map((note, offset) => {
                                    if (!note) return null;
                                    let slotOpacity = 0;
                                    if (slotVisible[offset]) {
                                        if (offset === 0) { slotOpacity = 1; }
                                        else if (offset === 1) { slotOpacity = 0.5; }
                                        else { slotOpacity = 0.2; }
                                    }
                                    return (
                                        <button
                                            key={note.id}
                                            className={`carousel-card carousel-card--pos${offset}`}
                                            style={{ opacity: slotOpacity, cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0 }}
                                            onClick={() => navigate(`/recurso/${note.id}`)}
                                        >
                                            <BrainMiniCard note={note} />
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </aside>
            </div>
        </>
    );
}