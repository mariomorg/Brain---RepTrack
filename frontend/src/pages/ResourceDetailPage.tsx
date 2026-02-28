import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { noteService } from '../features/cerebro/services/noteService';
import { Note } from '../features/cerebro/types/note.types';
import './ResourceDetailPage.css';

export default function ResourceDetailPage() {
  const { id } = useParams();

  const [note, setNote] = useState<Note | null>(null);
  const [similares, setSimilares] = useState<Note[]>([]);
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

        <section className="resource-section">
          <strong>Recurso original:</strong>
          <ReactMarkdown>{note.originalContent || 'Sin contenido original.'}</ReactMarkdown>
        </section>

        {note.summary && (
          <section className="resource-section">
            <strong>Propuesta IA:</strong>
            <ReactMarkdown>{note.summary}</ReactMarkdown>
          </section>
        )}
      </main>

      <aside className="resource-detail-aside">
        <div className="aside-buttons">
          <button className="aside-btn" type="button">Ver en mapa</button>
          <button className="aside-btn" type="button">Reinterpretar</button>
        </div>

        <div className="aside-similar">
          <h3>Recursos similares</h3>
          <ul>
            {similares.length === 0 && <li>No hay recursos similares.</li>}
            {similares.map((sim) => (
              <li key={sim.id}>
                <Link to={`/recurso/${sim.id}`}>{sim.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}