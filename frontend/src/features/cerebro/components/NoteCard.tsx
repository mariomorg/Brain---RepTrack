import { Note } from '../types/note.types';
import { TagChip } from '@shared/components/TagChip';

/* ---- Type icons ---- */
const TextIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
);

const LinkIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
);

const FileIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);

const AudioIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
    </svg>
);

const IdeaIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="2" x2="12" y2="6" />
        <path d="M12 6a6 6 0 016 6c0 2.5-1.5 4.5-3 5.5V20a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.5C7.5 16.5 6 14.5 6 12a6 6 0 016-6z" />
        <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
);

const VideoIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const ArticleIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
);

const CodeIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const VoiceNoteIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const ExternalIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

/**
 * Resolves the best type to display: prefers detectedType (richer),
 * falls back to type (coarser).
 */
function resolveType(type: string | null | undefined, detectedType: string | null | undefined): string {
    const dt = (detectedType ?? '').toUpperCase();
    if (dt && dt !== 'TEXT') return dt;
    return (type ?? '').toUpperCase() || 'TEXT';
}

function typeMeta(resolved: string): { label: string; className: string; Icon: () => JSX.Element } {
    switch (resolved) {
        case 'LINK':         return { label: 'Enlace',    className: 'note-type-badge--link',       Icon: LinkIcon };
        case 'FILE':         return { label: 'Archivo',   className: 'note-type-badge--file',       Icon: FileIcon };
        case 'AUDIO':        return { label: 'Audio',     className: 'note-type-badge--audio',      Icon: AudioIcon };
        case 'IDEA':         return { label: 'Idea',      className: 'note-type-badge--idea',       Icon: IdeaIcon };
        case 'VOICE_NOTE':   return { label: 'Voz',       className: 'note-type-badge--voice',      Icon: VoiceNoteIcon };
        case 'VIDEO_REF':    return { label: 'Vídeo',     className: 'note-type-badge--video',      Icon: VideoIcon };
        case 'ARTICLE_REF':  return { label: 'Artículo',  className: 'note-type-badge--article',    Icon: ArticleIcon };
        case 'CODE':         return { label: 'Código',    className: 'note-type-badge--code',       Icon: CodeIcon };
        default:             return { label: 'Texto',     className: 'note-type-badge--text',       Icon: TextIcon };
    }
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

interface NoteCardProps {
    note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
    const resolved = resolveType(note.type, note.detectedType);
    const { label, className, Icon } = typeMeta(resolved);
    const isLink = resolved === 'LINK';

    return (
        <article className="note-card">
            <div className="note-card__header">
                <span className={`note-type-badge ${className}`}>
                    <Icon />
                    {label}
                </span>
                <span className="note-card__date">{formatDate(note.createdAt)}</span>
            </div>

            <h3 className="note-card__title">{note.title}</h3>

            {note.summary && (
                <p className="note-card__summary">{note.summary}</p>
            )}

            {note.tags && note.tags.length > 0 && (
                <div className="note-card__tags">
                    {Array.from(
                        new Set(
                            note.tags.flatMap((tag) =>
                                tag.name
                                    .split('/')
                                    .filter(Boolean)
                                    .map((seg) => (seg.startsWith('#') ? seg.slice(1) : seg))
                            )
                        )
                    ).map((seg) => (
                        <TagChip key={seg} tag={seg} />
                    ))}
                </div>
            )}

            {isLink && note.path && (
                <a
                    href={note.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="note-card__link"
                >
                    Abrir Recurso Original&nbsp;<ExternalIcon />
                </a>
            )}
        </article>
    );
}
