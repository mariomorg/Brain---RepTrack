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

const ExternalIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

function typeMeta(type: string | null | undefined): { label: string; className: string; Icon: () => JSX.Element } {
    switch ((type ?? '').toUpperCase()) {
        case 'LINK': return { label: 'LINK', className: 'note-type-badge--link', Icon: LinkIcon };
        case 'FILE': return { label: 'FILE', className: 'note-type-badge--file', Icon: FileIcon };
        case 'AUDIO': return { label: 'AUDIO', className: 'note-type-badge--audio', Icon: AudioIcon };
        default: return { label: 'TEXT', className: 'note-type-badge--text', Icon: TextIcon };
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
    const { label, className, Icon } = typeMeta(note.type);
    const isLink = (note.type ?? '').toUpperCase() === 'LINK';

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
                    {note.tags
                        .map((tag) => (
                            <TagChip key={tag.name} tag={tag.name} />
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
