import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './shared/components/Layout';
import InboxPage from './features/inbox/components/InboxPage';
import CerebroPage from './features/cerebro/components/CerebroPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/inbox" replace />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/cerebro" element={<CerebroPage />} />
          <Route path="/configuracion" element={<ComingSoon title="Configuración" />} />
          <Route path="/perfil" element={<ComingSoon title="Perfil" />} />
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
