import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInbox } from '../hooks/useInbox';
import { InboxItem } from '../types/inbox.types';
import { TagChip } from '@shared/components/TagChip';
import { noteService } from '@features/cerebro/services/noteService';
import { Note } from '@features/cerebro/types/note.types';

/* --- Icons --- */
const LinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
);

const FileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);

const MicIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const BrainIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.85A3 3 0 016.5 9a3 3 0 012-2.83V4.5A2.5 2.5 0 019.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.85A3 3 0 0117.5 9a3 3 0 00-2-2.83V4.5A2.5 2.5 0 0014.5 2z" />
    </svg>
);

const ExtIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const TrashIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);

/* ---- Helpers ---- */
function isUrl(text: string): boolean {
    try { new URL(text); return true; } catch { return false; }
}

function detectType(text: string): string {
    if (isUrl(text.trim())) return 'LINK';
    return 'TEXT';
}

function formatRelativeTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'hace un momento';
    if (mins < 60) return `hace ${mins} minutos`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace alrededor de ${hrs} hora${hrs > 1 ? 's' : ''}`;
    const days = Math.floor(hrs / 24);
    return `hace ${days} día${days > 1 ? 's' : ''}`;
}

function typeLabelForItem(item: InboxItem): string {
    if (item.detectedType) return item.detectedType.replace('_', ' ');
    if (isUrl(item.rawText.trim())) return 'BROWSER EXTENSION';
    return 'TEXT';
}

/* ---- Mini note card for sidebar ---- */
function BrainMiniCard({ note }: { note: Note }) {
    return (
        <div className="brain-mini-card">
            <div className="brain-mini-card__type">
                <span style={{ color: note.type?.toUpperCase() === 'LINK' ? '#7C3AED' : '#059669' }}>
                    {note.type?.toUpperCase() === 'LINK' ? <LinkIcon /> : <FileIcon />}
                </span>
                {note.type ?? 'TEXT'}
            </div>
            <div className="brain-mini-card__title">{note.title}</div>
            {note.summary && (
                <div className="brain-mini-card__summary">{note.summary}</div>
            )}
            {note.tags && note.tags.length > 0 && (
                <div className="brain-mini-card__tags">
                    {note.tags.slice(0, 3).map((t) => <TagChip key={t} tag={t} />)}
                </div>
            )}
        </div>
    );
}

/* ---- Main component ---- */
export default function InboxPage() {
    const { pendingItems, pendingCount, loading, submitting, capture, remove } = useInbox();
    const [text, setText] = useState('');
    const [recentNotes, setRecentNotes] = useState<Note[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        noteService.findAll()
            .then((notes) => setRecentNotes(notes.slice(0, 4)))
            .catch(() => setRecentNotes([]));
    }, []);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        try {
            await capture({
                rawText: trimmed,
                detectedType: detectType(trimmed),
            });
            setText('');
            textareaRef.current?.focus();
        } catch { }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="inbox-layout">
            {/* Main panel */}
            <div className="inbox-main">
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 className="page-header__title">Inbox Unificado</h1>
                    <p className="page-header__subtitle">
                        Captura rápida de cualquier contenido. Sin pensar, sin clasificar.
                    </p>
                </div>

                {/* Capture box */}
                <div className="capture-box">
                    <textarea
                        ref={textareaRef}
                        className="capture-box__textarea"
                        placeholder="Escribe una idea, pega un enlace o arrastra archivos aquí..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={4}
                    />
                    <div className="capture-box__toolbar">
                        <button className="capture-toolbar-btn" title="Añadir enlace"><LinkIcon /></button>
                        <button className="capture-toolbar-btn" title="Adjuntar archivo"><FileIcon /></button>
                        <button className="capture-toolbar-btn" title="Grabar audio"><MicIcon /></button>
                        <button
                            className="capture-send-btn"
                            onClick={handleSend}
                            disabled={submitting || !text.trim()}
                            title="Guardar (Enter)"
                        >
                            <SendIcon />
                        </button>
                    </div>
                    <div className="capture-box__hint">
                        Enter para guardar&nbsp;•&nbsp;Arrastra archivos&nbsp;•&nbsp;Pega portapapeles
                    </div>
                </div>

                {/* Pending section */}
                <div className="pending-section__header">
                    <span className="pending-section__title">Pendientes de procesar</span>
                    <span className="pending-count-badge">{pendingCount} items</span>
                </div>

                {loading ? (
                    <div className="loading-spinner">Cargando…</div>
                ) : pendingItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">✅</div>
                        <p className="empty-state__text">Sin elementos pendientes. ¡Todo procesado!</p>
                    </div>
                ) : (
                    <div className="inbox-items-list">
                        {pendingItems.map((item) => (
                            <div key={item.id} className="inbox-item-card">
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="inbox-item__type-badge">
                                            <ExtIcon />
                                            {typeLabelForItem(item)}
                                        </div>
                                        <div className="inbox-item__text">{item.rawText}</div>
                                        {isUrl(item.rawText.trim()) && (
                                            <a
                                                href={item.rawText.trim()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inbox-item__link"
                                            >
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
                )}
            </div>

            {/* Right sidebar: Desde tu Cerebro */}
            <aside className="inbox-sidebar">
                <div className="inbox-sidebar__title">
                    <BrainIcon />
                    Desde tu Cerebro
                </div>

                {recentNotes.length === 0 ? (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
                        Aún no hay notas en tu Cerebro.
                    </div>
                ) : (
                    <>
                        {recentNotes.map((note) => (
                            <BrainMiniCard key={note.id} note={note} />
                        ))}
                        <span className="see-all-link" onClick={() => navigate('/cerebro')}>
                            Ver todo el cerebro →
                        </span>
                    </>
                )}
            </aside>
        </div>
    );
}
