import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { noteService } from '../features/cerebro/services/noteService';
import { Note } from '../features/cerebro/types/note.types';
import FileViewer from './FileViewer';
import './ResourceDetailPage.css';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote]                       = useState<Note | null>(null);
  const [similaresConTags, setSimilaresConTags] = useState<Note[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  // ── Edición ──────────────────────────────────────────────
  const [editing, setEditing]         = useState(false);
  const [editTitle, setEditTitle]     = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [saving, setSaving]           = useState(false);

  // ── Reinterpretar ─────────────────────────────────────────
  const [reinterpreting, setReinterpreting] = useState(false);
  const [reinterpretMsg, setReinterpretMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const n = await noteService.findById(id);
        if (cancelled) return;
        setNote(n);

        const sims = await noteService.findSimilares(id);
        if (cancelled) return;

        if (n?.tags?.length > 0) {
          const baseTags = n.tags.map(t => t.name);
          setSimilaresConTags(sims.filter(sim => sim.tags?.some(tag => baseTags.includes(tag.name))));
        } else {
          setSimilaresConTags([]);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.response?.data?.message || e?.message || 'Error cargando recurso');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [id]);

  const handleEditOpen = () => {
    if (!note) return;
    setEditTitle(note.title);
    setEditSummary(note.aiSummary ?? '');
    setEditing(true);
  };

  const handleEditSave = async () => {
    if (!note || !id) return;
    setSaving(true);
    try {
      const updated = await noteService.update(id, {
        title: editTitle,
        aiSummary: editSummary,
      });
      setNote(updated);
      setEditing(false);
    } catch (e: any) {
      alert('Error guardando: ' + (e?.message || 'desconocido'));
    } finally {
      setSaving(false);
    }
  };

  const handleReinterpret = async () => {
    if (!note?.inboxItemId) {
      setReinterpretMsg({ text: 'Esta nota no tiene item de inbox asociado.', error: true });
      return;
    }
    setReinterpreting(true);
    setReinterpretMsg(null);
    let isError = false;
    try {
      const updated = await noteService.reinterpret(note.id, note.inboxItemId);
      setNote(updated);
      setReinterpretMsg({ text: 'Reinterpretado correctamente', error: false });
    } catch (e: any) {
      isError = true;
      setReinterpretMsg({ text: 'Error: ' + (e?.message || 'desconocido'), error: true });
    } finally {
      setReinterpreting(false);
      setTimeout(() => setReinterpretMsg(null), 4000);
    }
    void isError;
  };

  if (loading) return <div style={{ padding: 32 }}>Cargando recurso…</div>;
  if (error)   return <div style={{ padding: 32, color: 'red' }}>Error: {error}</div>;
  if (!note)   return <div style={{ padding: 32 }}>Recurso no encontrado.</div>;

  return (
    <div className="resource-detail-layout">
      <main className="resource-detail-main">

        {/* Título con botón editar */}
        <div className="resource-title-row">
          {editing ? (
            <input
              className="edit-title-input"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              placeholder="Título"
            />
          ) : (
            <h1>{note.title}</h1>
          )}
          <button className="btn-edit" onClick={editing ? handleEditSave : handleEditOpen} disabled={saving}>
            {editing ? (saving ? 'Guardando…' : 'Guardar') : 'Editar'}
          </button>
          {editing && (
            <button className="btn-cancel" onClick={() => setEditing(false)}>Cancelar</button>
          )}
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div style={{ margin: '8px 0 16px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {note.tags.map(tag => (
              <span key={tag.name} style={{
                background: '#e0e0e0', borderRadius: 12,
                padding: '2px 10px', fontSize: 13,
              }}>{tag.name}</span>
            ))}
          </div>
        )}

        {/* Recurso original */}
        <section className="resource-section">
          <strong>Recurso original:</strong>
          {note.detectedType === 'FILE' ? (
            <FileViewer
              filename={note.originalContent || note.title}
              content={note.fileContent ?? null}
              fileUrl={note.fileUrl ?? `/api/notes/${note.id}/file`}
            />
          ) : note.detectedType === 'VIDEO_REF' ? (
            <div className="file-title-display">
              <p>{note.originalContent || note.title}</p>
              {note.sourceUrl && (
                <a href={note.sourceUrl} target="_blank" rel="noopener noreferrer" className="video-source-link">
                  {note.sourceUrl}
                </a>
              )}
            </div>
          ) : (
            <ReactMarkdown>{note.originalContent || 'Sin contenido original.'}</ReactMarkdown>
          )}
        </section>

        {/* Resumen extenso — editable */}
        {(note.aiSummary || editing) && (
          <section className="resource-section ai-summary-section">
            <strong>Resumen extenso:</strong>
            {editing ? (
              <textarea
                className="edit-textarea"
                value={editSummary}
                onChange={e => setEditSummary(e.target.value)}
                placeholder="Escribe el resumen en Markdown…"
                rows={14}
              />
            ) : (
              <ReactMarkdown>{note.aiSummary!}</ReactMarkdown>
            )}
          </section>
        )}

        {/* Propuesta IA */}
        {note.summary && (
          <section className="resource-section">
            <strong>Propuesta IA:</strong>
            <ReactMarkdown>{note.summary}</ReactMarkdown>
          </section>
        )}
      </main>

      <aside className="resource-detail-aside">
        {/* Foto estática del mapa — clickable → /mapa */}
        <div
          className="aside-map-static"
          onClick={() => navigate(`/mapa?ideaId=${note.id}`)}
          title="Abrir mapa completo"
        >
          <img src="/map-galaxy.png" alt="Mapa de conocimiento" />
          <div className="aside-map-static__hint">Ver en mapa</div>
        </div>

        {/* Botones de acción */}
        <div className="aside-actions">
          <button
            className="aside-btn-secondary"
            type="button"
            onClick={handleReinterpret}
            disabled={reinterpreting}
          >
            {reinterpreting ? (
              <><span className="spinner" /> Procesando…</>
            ) : 'Reinterpretar'}
          </button>
        </div>

        {/* Feedback reinterpretar */}
        {reinterpretMsg && (
          <p className={`reinterpret-msg${reinterpretMsg.error ? ' is-error' : ''}`}>
            {reinterpretMsg.text}
          </p>
        )}

        {/* Recursos similares */}
        <div className="aside-similar">
          <h3>Recursos similares</h3>
          <ul>
            {note.tags?.length > 0 ? (
              similaresConTags.length === 0 ? (
                <li style={{ fontSize: '0.88rem', color: '#9ca3af' }}>Sin similares encontrados</li>
              ) : (
                similaresConTags.map(sim => (
                  <li key={sim.id}><Link to={`/recurso/${sim.id}`}>{sim.title}</Link></li>
                ))
              )
            ) : (
              <li style={{ fontSize: '0.88rem', color: '#9ca3af' }}>Sin similares encontrados</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}