import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './ResourceDetailPage.css';

// Simulación: deberías obtener el recurso real por id
const mockNote = {
  id: '1',
  title: 'Ejemplo de recurso',
  content: '## Contenido original\nTexto original del recurso.',
  summary: '### Resumen IA\nEste es un resumen generado por IA.',
  tags: ['ejemplo', 'demo'],
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  // TODO: fetch real note by id
  const note = mockNote;

  return (
    <div className="resource-detail-layout">
      <main className="resource-detail-main">
        <h1>{note.title}</h1>
        <section className="resource-section">
          <strong>Recurso original:</strong>
          <ReactMarkdown children={note.content} />
        </section>
        {note.summary && (
          <section className="resource-section">
            <strong>Propuesta IA:</strong>
            <ReactMarkdown children={note.summary} />
          </section>
        )}
      </main>
      <aside className="resource-detail-aside">
        <div className="aside-buttons">
          <button className="aside-btn">Ver en mapa</button>
          <button className="aside-btn">Reinterpretar</button>
        </div>
        <div className="aside-similar">
          <h3>Recursos similares</h3>
          <ul>
            <li>Recurso relacionado 1</li>
            <li>Recurso relacionado 2</li>
            <li>Recurso relacionado 3</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
