
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './shared/components/Layout';
import InboxPage from './features/inbox/components/InboxPage';
import CerebroPage from './features/cerebro/components/CerebroPage';

// Nuevo: MapPage
import { MapCanvas } from './components/MapCanvas';
import { SidePanel } from './components/SidePanel';
import { TagNode, Idea } from './mockData';
import { getTagsByLevel, getIdeasVisible, getTagByPath } from './mockApi';
import { getMaxLevelForZoom } from './lib/lod';
import { buildBreadcrumbs } from './lib/breadcrumbs';

const INITIAL_CAMERA = { x: 0, y: 0, zoom: 0.8 };

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
  const [camera, setCamera] = React.useState(INITIAL_CAMERA);
  const [focusTagPath, setFocusTagPath] = React.useState<string | null>(null);
  const [selectedTag, setSelectedTag] = React.useState<TagNode | null>(null);
  const [selectedIdea, setSelectedIdea] = React.useState<Idea | null>(null);
  const [visibleTags, setVisibleTags] = React.useState<TagNode[]>([]);
  const [visibleIdeas, setVisibleIdeas] = React.useState<Idea[]>([]);
  const { width, height } = useWindowSize();
  const canvasWidth = Math.max(300, width - 340);
  const canvasHeight = Math.max(300, height - 56);

  React.useEffect(() => {
    getTagsByLevel(getMaxLevelForZoom(camera.zoom)).then(setVisibleTags);
  }, [camera.zoom]);

  React.useEffect(() => {
    getIdeasVisible(camera.zoom, focusTagPath).then(setVisibleIdeas);
  }, [camera.zoom, focusTagPath]);

  const handleSelectTag = (tag: TagNode) => {
    setSelectedTag(tag);
    setFocusTagPath(tag.path);
    setSelectedIdea(null);
  };
  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
  };
  const handleFocusTag = (tag: TagNode) => {
    setFocusTagPath(tag.path);
    setSelectedTag(tag);
    setSelectedIdea(null);
  };
  const handleBreadcrumbClick = (path: string) => {
    const tag = getTagByPath(path);
    if (tag) {
      setFocusTagPath(tag.path);
      setSelectedTag(tag);
      setSelectedIdea(null);
      setCamera({ x: tag.x, y: tag.y, zoom: tag.level === 0 ? 1.0 : tag.level === 1 ? 1.6 : 2.0 });
    }
  };
  const handleResetView = () => {
    setCamera(INITIAL_CAMERA);
    setFocusTagPath(null);
    setSelectedTag(null);
    setSelectedIdea(null);
  };
  const breadcrumbs = buildBreadcrumbs(focusTagPath);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100vh', background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', width: '100%', height: '100vh', minHeight: '600px' }}>
        {/* El Layout ya pone el sidebar a la izquierda */}
        <div style={{ flex: 1, display: 'flex', height: '100vh', minWidth: 0 }}>
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
            width={canvasWidth}
            height={canvasHeight}
          />
          <SidePanel
            selectedTag={selectedTag}
            selectedIdea={selectedIdea}
            onSelectIdea={handleSelectIdea}
          />
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
          <Route path="*" element={<Navigate to="/" replace />} />
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
