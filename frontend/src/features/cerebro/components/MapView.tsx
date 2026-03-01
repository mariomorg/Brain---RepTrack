import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapCanvas } from '../../../components/MapCanvas';
import { fetchMapData } from '../../map/services/mapService';
import { TagNode, Idea } from '../../../mockData';

function fitAllZoom(w: number, h: number, worldSpan: number): number {
  return Math.min(w / worldSpan, h / worldSpan) * 0.82;
}

function useContainerSize(ref: React.RefObject<HTMLDivElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    // Measure immediately on mount
    const { width, height } = ref.current.getBoundingClientRect();
    if (width > 0 && height > 0) setSize({ width, height });

    const ro = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** Shared hook: loads map data + computes initial camera */
function useMapData(width: number, height: number) {
  const [tags, setTags] = useState<TagNode[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const initialZoom = useRef(0.08);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.08 });

  useEffect(() => {
    fetchMapData()
      .then(({ tags: t, ideas: i }) => {
        setTags(t);
        setIdeas(i);
        if (t.length > 0) {
          const maxDist = Math.max(
            ...t.map((n) => Math.sqrt(n.x * n.x + n.y * n.y) + ((n as any).radius ?? 200))
          );
          const zoom = fitAllZoom(width, height, maxDist * 2);
          initialZoom.current = zoom;
          setCamera({ x: 0, y: 0, zoom });
        }
      })
      .catch(() => {
        Promise.all([
          import('../../../mockApi').then((m) => m.getTagsByLevel(2)),
          import('../../../mockApi').then((m) => m.getIdeasVisible(0.1, null)),
        ]).then(([t, i]) => { setTags(t); setIdeas(i); });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fit on container resize
  useEffect(() => {
    if (tags.length === 0) return;
    const maxDist = Math.max(
      ...tags.map((n) => Math.sqrt(n.x * n.x + n.y * n.y) + ((n as any).radius ?? 200))
    );
    const zoom = fitAllZoom(width, height, maxDist * 2);
    initialZoom.current = zoom;
    setCamera({ x: 0, y: 0, zoom });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  return { tags, ideas, camera, setCamera, initialZoom };
}

/* ─────────────────────────────────────────────────────────────────
   MapView — full embedded map used inside CerebroPage (view mode)
───────────────────────────────────────────────────────────────── */
export function MapView() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null!);
  const { width, height } = useContainerSize(containerRef);
  const { tags, ideas, camera, setCamera, initialZoom } = useMapData(width, height);

  const [resetSignal, setResetSignal] = useState(0);
  const [selectedTag, setSelectedTag] = useState<TagNode | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [lightMode, setLightMode] = useState(() =>
    localStorage.getItem('map-light-mode') === 'true'
  );

  return (
    <div className="cerebro-map-view" ref={containerRef}>
      {/* Toolbar overlay */}
      <div className="cerebro-map-view__toolbar">
        <button
          className="cerebro-map-view__reset-btn"
          onClick={() => setResetSignal((s) => s + 1)}
          title="Vista general"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Vista general
        </button>
        <button
          className="cerebro-map-view__reset-btn"
          onClick={() => {
            const next = !lightMode;
            setLightMode(next);
            localStorage.setItem('map-light-mode', String(next));
          }}
          title={lightMode ? 'Cambiar a fondo oscuro' : 'Cambiar a fondo blanco'}
          type="button"
        >
          {lightMode ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
          {lightMode ? 'Oscuro' : 'Claro'}
        </button>
        <button
          className="cerebro-map-view__fullscreen-btn"
          onClick={() => navigate('/mapa')}
          title="Abrir mapa completo"
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
          </svg>
          Abrir mapa
        </button>
      </div>

      <MapCanvas
        camera={camera}
        setCamera={setCamera}
        tags={tags}
        ideas={ideas}
        focusTagPath={null}
        selectedTag={selectedTag}
        selectedIdea={selectedIdea}
        onSelectTag={(t) => { setSelectedTag(t); setSelectedIdea(null); }}
        onSelectIdea={(i) => setSelectedIdea(i)}
        onFocusTag={(t) => { setSelectedTag(t); setSelectedIdea(null); }}
        onNavigateToNote={(idea) => navigate(`/recurso/${idea.id}`)}
        width={width}
        height={height}
        resetViewSignal={resetSignal}
        initialZoom={initialZoom.current}
        lightMode={lightMode}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MiniMapPreview — compact map preview used in ResourceDetailPage aside.
   Clicking it navigates to /mapa?ideaId=<noteId>.
───────────────────────────────────────────────────────────────── */
export function MiniMapPreview({ noteId }: { noteId: string }) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null!);
  const { width, height } = useContainerSize(containerRef);
  const { tags, ideas, camera, setCamera, initialZoom } = useMapData(width, height);

  const [selectedTag, setSelectedTag] = useState<TagNode | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  // Auto-select the idea matching noteId so it renders highlighted
  useEffect(() => {
    if (!noteId || ideas.length === 0) return;
    const match = ideas.find((i) => i.id === noteId);
    if (match) setSelectedIdea(match);
  }, [noteId, ideas]);

  return (
    <div
      className="aside-map-canvas-wrap"
      ref={containerRef}
      onClick={() => navigate(`/mapa?ideaId=${noteId}`)}
      title="Ver en el mapa"
    >
      {width > 10 && height > 10 && (
        /* pointer-events:none so the wrapper div captures the click, not the canvas */
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <MapCanvas
            camera={camera}
            setCamera={setCamera}
            tags={tags}
            ideas={ideas}
            focusTagPath={null}
            selectedTag={selectedTag}
            selectedIdea={selectedIdea}
            onSelectTag={(t) => { setSelectedTag(t); setSelectedIdea(null); }}
            onSelectIdea={(i) => setSelectedIdea(i)}
            onFocusTag={(t) => { setSelectedTag(t); setSelectedIdea(null); }}
            onNavigateToNote={(idea) => navigate(`/recurso/${idea.id}`)}
            width={width}
            height={height}
            initialZoom={initialZoom.current}
          />
        </div>
      )}
      {/* Overlay hover hint */}
      <div className="aside-map-canvas-wrap__hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
        </svg>
        Ver en mapa
      </div>
    </div>
  );
}
