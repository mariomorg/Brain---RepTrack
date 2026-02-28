import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note } from '../types/note.types';
import { noteService } from '../services/noteService';

// ── Tree data model ──────────────────────────────────────────────────────────

interface FolderNode {
    name: string;
    fullPath: string;
    children: Record<string, FolderNode>;
    notes: Note[];
}

function buildFolderTree(notes: Note[]): FolderNode {
    const root: FolderNode = { name: '', fullPath: '', children: {}, notes: [] };

    for (const note of notes) {
        const rawPaths: string[] = note.tags.length > 0
            ? note.tags.map(t => t.name).filter(Boolean)
            : note.path
                ? [note.path]
                : [];

        if (rawPaths.length === 0) {
            root.notes.push(note);
            continue;
        }

        // Keep only the deepest (most specific) paths — drop any path that is
        // a prefix of another path in the same note's tag list.
        // e.g. ["cocina", "cocina/reposteria", "cocina/reposteria/masas"]
        //   → ["cocina/reposteria/masas"]
        const deepest = rawPaths.filter(p =>
            !rawPaths.some(other => other !== p && other.startsWith(p + '/'))
        );

        // Deduplicate by deepest path so the note is placed exactly once per leaf
        const seen = new Set<string>();
        for (const tagPath of deepest) {
            const normalized = tagPath.replace(/^#/, '');
            if (seen.has(normalized)) continue;
            seen.add(normalized);

            const segments = normalized.split('/').filter(Boolean);
            let current = root;
            let cumPath = '';

            for (let i = 0; i < segments.length; i++) {
                const seg = segments[i];
                cumPath = cumPath ? `${cumPath}/${seg}` : seg;

                if (!current.children[seg]) {
                    current.children[seg] = {
                        name: seg,
                        fullPath: cumPath,
                        children: {},
                        notes: [],
                    };
                }

                // Place the note only at the leaf of this path
                if (i === segments.length - 1) {
                    const alreadyAdded = current.children[seg].notes.some(n => n.id === note.id);
                    if (!alreadyAdded) {
                        current.children[seg].notes.push(note);
                    }
                }

                current = current.children[seg];
            }
        }
    }

    return root;
}

// ── Icons ────────────────────────────────────────────────────────────────────

const FolderClosedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
);

const FolderOpenIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        <polyline points="1 11 1 19 23 19 23 11" />
    </svg>
);

const NoteFileIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

// ── Sparkle icon ─────────────────────────────────────────────────────────────
const SparkleIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
);

// ── AI Summary panel ──────────────────────────────────────────────────────────

interface FolderSummaryProps {
    node: FolderNode;
}

function FolderSummaryPanel({ node }: FolderSummaryProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [summary, setSummary] = useState<string>('');

    const handleSummarise = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (status === 'loading') return;
        setStatus('loading');
        setSummary('');
        try {
            const result = await noteService.folderSummary(
                node.name,
                node.fullPath,
                node.notes.map(n => n.id)
            );
            setSummary(result);
            setStatus('done');
        } catch {
            setSummary('No se pudo conectar con la IA. Asegúrate de que el backend está activo.');
            setStatus('error');
        }
    };

    return (
        <>
            <button
                className={`fv-summarise-btn ${status === 'loading' ? 'loading' : ''}`}
                onClick={handleSummarise}
                title="Generar resumen de IA para esta carpeta"
                disabled={status === 'loading'}
                type="button"
            >
                <SparkleIcon />
                {status === 'loading' ? 'Pensando…' : 'Resumir'}
            </button>

            {(status === 'done' || status === 'error') && summary && (
                <div className={`fv-summary-panel ${status === 'error' ? 'fv-summary-panel--error' : ''}`}>
                    <div className="fv-summary-panel__header">
                        <span className="fv-summary-panel__icon"><SparkleIcon /></span>
                        <span className="fv-summary-panel__label">Resumen IA — {node.name}</span>
                        <button
                            className="fv-summary-panel__close"
                            onClick={e => { e.stopPropagation(); setStatus('idle'); setSummary(''); }}
                            type="button"
                        >✕</button>
                    </div>
                    <p className="fv-summary-panel__text">{summary}</p>
                </div>
            )}
        </>
    );
}

// ── Folder node component ─────────────────────────────────────────────────────

interface FolderNodeItemProps {
    node: FolderNode;
    level: number;
    defaultExpanded?: boolean;
}

function FolderNodeItem({ node, level, defaultExpanded = false }: FolderNodeItemProps) {
    const [expanded, setExpanded] = useState(defaultExpanded || level === 0);
    const navigate = useNavigate();

    const childKeys = Object.keys(node.children);
    const isLeaf = childKeys.length === 0;      // leaf = no sub-folders
    const hasNotes = node.notes.length > 0;
    const total = countNotes(node);

    return (
        <div className="fv-folder">
            {/* Folder row */}
            <div
                className="fv-folder__row"
                style={{ paddingLeft: 8 + level * 20 }}
                onClick={() => setExpanded(v => !v)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setExpanded(v => !v); }}
            >
                <span className="fv-folder__chevron">{expanded ? '▾' : '▸'}</span>
                <span className="fv-folder__icon">
                    {expanded ? <FolderOpenIcon /> : <FolderClosedIcon />}
                </span>
                <span className="fv-folder__name">{node.name}</span>
                <span className="fv-folder__count">{total}</span>

                {/* ✨ AI summarise button only for leaf folders with notes */}
                {isLeaf && hasNotes && (
                    <FolderSummaryPanel node={node} />
                )}
            </div>

            {/* Children */}
            {expanded && (
                <div className="fv-folder__children">
                    {/* Sub-folders first */}
                    {childKeys.sort().map(key => (
                        <FolderNodeItem
                            key={node.children[key].fullPath}
                            node={node.children[key]}
                            level={level + 1}
                            defaultExpanded={false}
                        />
                    ))}

                    {/* Notes in this folder */}
                    {hasNotes && node.notes.map(note => (
                        <div
                            key={note.id}
                            className="fv-note-row"
                            style={{ paddingLeft: 8 + (level + 1) * 20 }}
                            onClick={e => { e.stopPropagation(); navigate(`/recurso/${note.id}`); }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/recurso/${note.id}`); }}
                        >
                            <span className="fv-note-row__icon"><NoteFileIcon /></span>
                            <span className="fv-note-row__title">{note.title}</span>
                            {note.tags.length > 0 && (
                                <span className="fv-note-row__tags">
                                    {Array.from(new Set(
                                        note.tags.flatMap(t => t.name.split('/').filter(Boolean))
                                    )).slice(0, 3).map(seg => (
                                        <span key={seg} className="fv-note-row__tag">#{seg}</span>
                                    ))}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function countNotes(node: FolderNode): number {
    return node.notes.length + Object.values(node.children).reduce((acc, c) => acc + countNotes(c), 0);
}

// ── Public component ──────────────────────────────────────────────────────────

interface FolderViewProps {
    notes: Note[];
}

export function FolderView({ notes }: FolderViewProps) {
    const tree = useMemo(() => buildFolderTree(notes), [notes]);
    const rootKeys = Object.keys(tree.children).sort();
    const hasUncategorized = tree.notes.length > 0;
    const navigate = useNavigate();

    if (notes.length === 0) return null;

    return (
        <div className="folder-view">
            {/* Root-level folders */}
            {rootKeys.map(key => (
                <FolderNodeItem
                    key={tree.children[key].fullPath}
                    node={tree.children[key]}
                    level={0}
                    defaultExpanded={rootKeys.length <= 5}
                />
            ))}

            {/* Uncategorized notes */}
            {hasUncategorized && (
                <div className="fv-folder">
                    <div className="fv-folder__row fv-folder__row--uncategorized" style={{ paddingLeft: 8 }}>
                        <span className="fv-folder__icon"><FolderClosedIcon /></span>
                        <span className="fv-folder__name" style={{ fontStyle: 'italic' }}>Sin categoría</span>
                        <span className="fv-folder__count">{tree.notes.length}</span>
                    </div>
                    <div className="fv-folder__children">
                        {tree.notes.map(note => (
                            <div
                                key={note.id}
                                className="fv-note-row"
                                style={{ paddingLeft: 28 }}
                                onClick={() => navigate(`/recurso/${note.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/recurso/${note.id}`); }}
                            >
                                <span className="fv-note-row__icon"><NoteFileIcon /></span>
                                <span className="fv-note-row__title">{note.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
