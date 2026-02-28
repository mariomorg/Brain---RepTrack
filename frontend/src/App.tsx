
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './shared/components/Layout';
import InboxPage from './features/inbox/components/InboxPage';
import CerebroPage from './features/cerebro/components/CerebroPage';
import ResourceDetailPage from './pages/ResourceDetailPage';

// Nuevo: MapPage
import { MapCanvas } from './components/MapCanvas';
import { SidePanel } from './components/SidePanel';
import { IdeaPopup } from './components/IdeaPopup';
import { TagNode, Idea, ROOT_COLORS } from './mockData';
import { fetchMapData } from './features/map/services/mapService';

/** Zoom inicial: ajusta para que todos los nodos quepan cómodamente */
function fitAllZoom(canvasW: number, canvasH: number, worldSpan: number): number {
  const zoomX = canvasW / worldSpan;
  const zoomY = canvasH / worldSpan;
  return Math.min(zoomX, zoomY) * 0.80;
}

const useWindowSize = () => {
  const [size, setSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  React.useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
};

import { useLocation } from 'react-router-dom';

const MapPage: React.FC = () => {
  const { width, height } = useWindowSize();
  const navigate = useNavigate();
  const location = useLocation();
  const canvasWidth  = Math.max(300, width - 240);
  const canvasHeight = Math.max(300, height);

  const [camera, setCamera]         = React.useState({ x: 0, y: 0, zoom: 0.08 });
  const initialZoom                 = React.useRef(0.08);
  const [resetViewSignal, setResetViewSignal] = React.useState(0);
  const [focusTagPath, setFocusTagPath] = React.useState<string | null>(null);
  const [selectedTag, setSelectedTag]   = React.useState<TagNode | null>(null);
  const [selectedIdea, setSelectedIdea] = React.useState<Idea | null>(null);
  const [popupIdea, setPopupIdea]       = React.useState<Idea | null>(null);
  const [visibleTags, setVisibleTags]   = React.useState<TagNode[]>([]);
  const [visibleIdeas, setVisibleIdeas] = React.useState<Idea[]>([]);
  // Si hay ideaId en la query, centrar y seleccionar esa idea
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ideaId = params.get('ideaId');
    if (ideaId && visibleIdeas.length > 0) {
      const idea = visibleIdeas.find(i => i.id === ideaId);
      if (idea) {
        setSelectedIdea(idea);
        // Centrar cámara en la idea y hacer más zoom
        setCamera({ x: idea.x, y: idea.y, zoom: 1 });
      }
    }
    // eslint-disable-next-line
  }, [location.search, visibleIdeas]);

  React.useEffect(() => {
    fetchMapData()
      .then(({ tags, ideas }) => {
        // El servicio ya devuelve TagNode[] e Idea[] directamente
        setVisibleTags(tags);
        setVisibleIdeas(ideas);

        // Calcular zoom para que todo el mapa quepa en pantalla
        if (tags.length > 0) {
          const maxDist = Math.max(...tags.map(t =>
            Math.sqrt(t.x * t.x + t.y * t.y) + (t.radius ?? 200)
          ));
          const worldSpan = maxDist * 2;
          const zoom = fitAllZoom(canvasWidth, canvasHeight, worldSpan);
          initialZoom.current = zoom;
          setCamera({ x: 0, y: 0, zoom });
        }
      })
      .catch(err => {
        console.warn('API no disponible, cargando datos mock:', err);
        Promise.all([
          import('./mockApi').then(m => m.getTagsByLevel(2)),
          import('./mockApi').then(m => m.getIdeasVisible(0.1, null)),
        ]).then(([tags, ideas]) => {
          setVisibleTags(tags);
          setVisibleIdeas(ideas);
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTag = (tag: TagNode) => {
    setSelectedTag(tag);
    setFocusTagPath(tag.path);
    setSelectedIdea(null);
  };
  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setPopupIdea(idea);
  };
  const handleNavigateToNote = (idea: Idea) => {
    navigate(`/recurso/${idea.id}`);
  };
  const handleFocusTag = (tag: TagNode) => {
    setFocusTagPath(tag.path);
    setSelectedTag(tag);
    setSelectedIdea(null);
  };
  const handleResetView = () => {
    setResetViewSignal(s => s + 1);
    setFocusTagPath(null);
    setSelectedTag(null);
    setSelectedIdea(null);
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100vh', background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: '100%', height: '100vh', minHeight: '600px' }}>
        <div style={{ flex: 1, display: 'flex', height: '100vh', minWidth: 0, position: 'relative' }}>
          <MapCanvas
            camera={camera}
            setCamera={setCamera}
            tags={visibleTags}
            ideas={visibleIdeas}
            focusTagPath={focusTagPath}
            selectedTag={selectedTag}
            selectedIdea={selectedIdea}
            onSelectTag={handleSelectTag}
            onSelectIdea={handleSelectIdea}
            onFocusTag={handleFocusTag}
            onNavigateToNote={handleNavigateToNote}
            width={canvasWidth}
            height={canvasHeight}
            resetViewSignal={resetViewSignal}
            initialZoom={initialZoom.current}
          />

          {/* Botón "Vista general" — overlay esquina superior izquierda */}
          <button
            onClick={handleResetView}
            title="Ver todos los temas"
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,0,0,0.10)',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: '#1a1a2e',
              letterSpacing: 0.2,
              transition: 'background 0.15s, box-shadow 0.15s',
              zIndex: 10,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.92)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.72)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6.5" stroke="#1a1a2e" strokeWidth="1.5"/>
              <circle cx="8" cy="8" r="2.5" fill="#1a1a2e"/>
              <line x1="8" y1="1.5" x2="8" y2="4"   stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="8" y2="14.5" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1.5" y1="8" x2="4"   y2="8" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="12"  y1="8" x2="14.5" y2="8" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Vista general
          </button>

          <SidePanel
            selectedTag={selectedTag}
            selectedIdea={selectedIdea}
            onSelectIdea={handleSelectIdea}
            allTags={visibleTags}
            onSelectTag={handleSelectTag}
          />

          {/* Popup de idea — aparece al hacer click en un pin */}
          {popupIdea && (
            <IdeaPopup
              idea={popupIdea}
              accentColor={ROOT_COLORS[popupIdea.tagPaths[0]?.split('/')[0] ?? ''] ?? '#43BCCD'}
              onClose={() => { setPopupIdea(null); setSelectedIdea(null); }}
              onNavigate={(idea) => { setPopupIdea(null); navigate(`/recurso/${idea.id}`); }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

function HomeButton() {
  const navigate = useNavigate();
  return (
    <button
      style={{ margin: 16, padding: '0.7em 1.5em', fontSize: 18, borderRadius: 8, background: '#4F8A8B', color: '#fff', border: 'none', cursor: 'pointer' }}
      onClick={() => navigate('/mapa')}
    >
      Ir al Mapa de Tags
    </button>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeButton />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/cerebro" element={<CerebroPage />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/configuracion" element={<ComingSoon title="Configuración" />} />
          <Route path="/perfil" element={<ComingSoon title="Perfil" />} />
          <Route path="/recurso/:id" element={<ResourceDetailPage />} />
          <Route path="*" element={<Navigate to="/inbox" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: '48px 32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 8 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14 }}>Esta sección estará disponible próximamente.</p>
    </div>
  );
}

export default App;
