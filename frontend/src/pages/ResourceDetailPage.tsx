import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { noteService } from '../features/cerebro/services/noteService';
import { Note } from '../features/cerebro/types/note.types';
import './ResourceDetailPage.css';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState<Note | null>(null);
  const [similares, setSimilares] = useState<Note[]>([]);
  const [similaresConTags, setSimilaresConTags] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setSimilares(sims);

        // Filtrar recursos similares que compartan al menos una tag
        if (n && n.tags && n.tags.length > 0) {
          const baseTags = n.tags.map((t) => t.name);
          const conTags = sims.filter(sim =>
            sim.tags && sim.tags.some(tag => baseTags.includes(tag.name))
          );
          setSimilaresConTags(conTags);
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

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div style={{ padding: 32 }}>Cargando recurso…</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>Error: {error}</div>;
  if (!note) return <div style={{ padding: 32 }}>Recurso no encontrado.</div>;

  return (
    <div className="resource-detail-layout">
      <main className="resource-detail-main">

        <h1>{note.title}</h1>
        {note.tags && note.tags.length > 0 && (
          <div style={{ margin: '8px 0 16px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {note.tags.map((tag) => (
              <span key={tag.name} style={{
                background: '#e0e0e0',
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 13,
                marginRight: 4
              }}>{tag.name}</span>
            ))}
          </div>
        )}

        <section className="resource-section">
          <strong>Recurso original:</strong>
          {note.detectedType === 'FILE' ? (
            <p className="file-title-display">📄 {note.originalContent || note.title}</p>
          ) : (
            <ReactMarkdown>{note.originalContent || 'Sin contenido original.'}</ReactMarkdown>
          )}
        </section>

        {note.aiSummary && (
          <section className="resource-section ai-summary-section">
            <strong>Resumen extenso:</strong>
            <ReactMarkdown>{note.aiSummary}</ReactMarkdown>
          </section>
        )}

        {note.summary && (
          <section className="resource-section">
            <strong>Propuesta IA:</strong>
            <ReactMarkdown>{note.summary}</ReactMarkdown>
          </section>
        )}
      </main>

      <aside className="resource-detail-aside">
        <div className="aside-buttons">
          <button
            className="aside-btn"
            type="button"
            onClick={() => {
              if (note) {
                navigate(`/mapa?ideaId=${note.id}`);
              }
            }}
          >
            Ver en mapa
          </button>
          <button className="aside-btn" type="button">Reinterpretar</button>
        </div>

        <div className="aside-similar">
          <h3>Recursos similares</h3>
          <ul>
            {note && note.tags && note.tags.length > 0 ? (
              similaresConTags.length === 0 ? (
                <li>No se encontraron recursos similares.</li>
              ) : (
                similaresConTags.map((sim) => (
                  <li key={sim.id}>
                    <Link to={`/recurso/${sim.id}`}>{sim.title}</Link>
                  </li>
                ))
              )
            ) : (
              <li>No se encontraron recursos similares.</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}