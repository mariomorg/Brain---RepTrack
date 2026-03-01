import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import Layout from './shared/components/Layout';
import InboxPage from './features/inbox/components/InboxPage';

import CerebroPage from './features/cerebro/components/CerebroPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import PerfilPage from './pages/PerfilPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuth2CallbackPage from './pages/OAuth2CallbackPage';
import CalendarPage from './pages/CalendarPage';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import PWAUpdatePrompt from './shared/components/PWAUpdatePrompt';
import ShareTargetPage from './pages/ShareTargetPage';

import { MapCanvas } from './components/MapCanvas';
import { SidePanel } from './components/SidePanel';
import { IdeaPopup } from './components/IdeaPopup';
import { TagNode, Idea, ROOT_COLORS } from './mockData';
import { fetchMapData } from './features/map/services/mapService';

/** Zoom inicial: ajusta para que todos los nodos quepan cómodamente */
function fitAllZoom(canvasW: number, canvasH: number, worldSpan: number): number {
  const zoomX = canvasW / worldSpan;
  const zoomY = canvasH / worldSpan;
  return Math.min(zoomX, zoomY) * 0.8;
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

const MapPage: React.FC = () => {
  const { width, height } = useWindowSize();
  const navigate = useNavigate();
  const location = useLocation();

  // 240 parece el ancho del sidebar/layout; ajusta si cambia
  const canvasWidth = Math.max(300, width - 240);
  const canvasHeight = Math.max(300, height);

  const [camera, setCamera] = React.useState({ x: 0, y: 0, zoom: 0.08 });
  const initialZoom = React.useRef(0.08);
  const [resetViewSignal, setResetViewSignal] = React.useState(0);
  const [focusTagPath, setFocusTagPath] = React.useState<string | null>(null);
  const [selectedTag, setSelectedTag] = React.useState<TagNode | null>(null);
  const [selectedIdea, setSelectedIdea] = React.useState<Idea | null>(null);
  const [popupIdea, setPopupIdea] = React.useState<Idea | null>(null);
  const [visibleTags, setVisibleTags] = React.useState<TagNode[]>([]);
  const [visibleIdeas, setVisibleIdeas] = React.useState<Idea[]>([]);

  // Cargar datos del mapa
  React.useEffect(() => {
    fetchMapData()
      .then(({ tags, ideas }) => {
        setVisibleTags(tags);
        setVisibleIdeas(ideas);

        // Calcular zoom para que todo el mapa quepa en pantalla
        if (tags.length > 0) {
          const maxDist = Math.max(
            ...tags.map((t) => Math.sqrt(t.x * t.x + t.y * t.y) + ((t as any).radius ?? 200))
          );
          const worldSpan = maxDist * 2;
          const zoom = fitAllZoom(canvasWidth, canvasHeight, worldSpan);
          initialZoom.current = zoom;
          setCamera({ x: 0, y: 0, zoom });
        }
      })
      .catch((err) => {
        console.warn('API no disponible, cargando datos mock:', err);
        Promise.all([
          import('./mockApi').then((m) => m.getTagsByLevel(2)),
          import('./mockApi').then((m) => m.getIdeasVisible(0.1, null)),
        ]).then(([tags, ideas]) => {
          setVisibleTags(tags);
          setVisibleIdeas(ideas);
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si hay ideaId en la query, centrar y seleccionar esa idea
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ideaId = params.get('ideaId');
    if (!ideaId) return;

    const idea = visibleIdeas.find((i) => i.id === ideaId);
    if (idea) {
      setSelectedIdea(idea);
      setPopupIdea(idea);
      // Enfocar el tag principal de la idea para que aparezca resaltado
      const primaryTag = idea.tagPaths?.[0] ?? null;
      setFocusTagPath(primaryTag);
      const parentTag = visibleTags.find(t => t.path === primaryTag) ?? null;
      setSelectedTag(parentTag);
      // Centrar en el tag padre (burbuja grande)
      const cx = parentTag ? parentTag.x : idea.x;
      const cy = parentTag ? parentTag.y : idea.y;
      // Zoom dinámico: que la burbuja quepa en pantalla con margen
      // Si no hay tag padre usamos un radio estimado de 300
      const tagR = parentTag?.radius ?? 300;
      const fitZoom = Math.min(canvasWidth, canvasHeight) / (tagR * 2) * 0.75;
      // Mínimo 0.8 para que los pins sean visibles, máximo 1.6 para no estar demasiado cerca
      const zoom = Math.min(1.6, Math.max(0.8, fitZoom));
      setCamera({ x: cx, y: cy, zoom });
    }
  }, [location.search, visibleIdeas]);

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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.72)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.10)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6.5" stroke="#1a1a2e" strokeWidth="1.5" />
              <circle cx="8" cy="8" r="2.5" fill="#1a1a2e" />
              <line x1="8" y1="1.5" x2="8" y2="4" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="8" y1="12" x2="8" y2="14.5" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="1.5" y1="8" x2="4" y2="8" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="8" x2="14.5" y2="8" stroke="#1a1a2e" strokeWidth="1.5" strokeLinecap="round" />
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

/** Wrapper that redirects to /login when not authenticated */
function ProtectedRoute({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/inbox" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/inbox" replace /> : <RegisterPage />} />
      <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />
      <Route path="/share-target" element={<ShareTargetPage />} />

      {/* Protected routes — wrapped in Layout */}
      <Route path="/" element={<Navigate to={user ? "/inbox" : "/login"} replace />} />
      <Route path="/inbox" element={<ProtectedRoute><Layout><InboxPage /></Layout></ProtectedRoute>} />
      <Route path="/cerebro" element={<ProtectedRoute><Layout><CerebroPage /></Layout></ProtectedRoute>} />
      <Route path="/mapa" element={<ProtectedRoute><Layout><MapPage /></Layout></ProtectedRoute>} />
      <Route path="/calendario" element={<ProtectedRoute><Layout><CalendarPage /></Layout></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Layout><ConfiguracionPage /></Layout></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Layout><PerfilPage /></Layout></ProtectedRoute>} />
      <Route path="/recurso/:id" element={<ProtectedRoute><Layout><ResourceDetailPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? "/inbox" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <PWAUpdatePrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;