import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@shared/api/apiClient';
import './ConfiguracionPage.css';

/* ─── Types ───────────────────────────────────────────── */
interface ServiceStatus {
  status: 'up' | 'down' | 'degraded' | 'checking';
  url?: string;
  model?: string;
  whisperModel?: string;
  device?: string;
  database?: string;
  availableModels?: string[];
  error?: string;
}

interface ServicesHealth {
  ollama: ServiceStatus;
  transcription: ServiceStatus;
  database: ServiceStatus;
}

const EMPTY_STATUS: ServiceStatus = { status: 'checking' };

/* ─── Helpers ─────────────────────────────────────────── */
function statusIndicator(s: ServiceStatus['status']) {
  switch (s) {
    case 'up':       return { dot: 'status-dot--up',       label: 'Activo' };
    case 'down':     return { dot: 'status-dot--down',     label: 'Inactivo' };
    case 'degraded': return { dot: 'status-dot--degraded', label: 'Degradado' };
    default:         return { dot: 'status-dot--checking', label: 'Verificando…' };
  }
}

/* ─── Component ───────────────────────────────────────── */
const ConfiguracionPage: React.FC = () => {
  /* ── Theme ── */
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.dataset.theme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      delete root.dataset.theme;
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  /* ── Health ── */
  const [health, setHealth] = useState<ServicesHealth>({
    ollama: { ...EMPTY_STATUS },
    transcription: { ...EMPTY_STATUS },
    database: { ...EMPTY_STATUS },
  });
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await apiClient.get<ServicesHealth>('/health/services');
      setHealth(res.data);
      setLastChecked(new Date());
    } catch {
      setHealth({
        ollama: { status: 'down', error: 'No se pudo conectar al backend' },
        transcription: { status: 'down', error: 'No se pudo conectar al backend' },
        database: { status: 'down', error: 'No se pudo conectar al backend' },
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  /* ── Render helpers ── */
  const renderServiceCard = (
    title: string,
    icon: string,
    svc: ServiceStatus,
    details: React.ReactNode,
  ) => {
    const { dot, label } = statusIndicator(svc.status);
    return (
      <div className="svc-card" key={title}>
        <div className="svc-card__header">
          <span className="svc-card__icon">{icon}</span>
          <span className="svc-card__title">{title}</span>
          <span className={`status-dot ${dot}`} />
          <span className={`svc-card__label ${dot}`}>{label}</span>
        </div>
        <div className="svc-card__body">{details}</div>
      </div>
    );
  };

  return (
    <div className="config-page">
      <header className="config-header">
        <h1>Configuración</h1>
        <p>Gestiona el aspecto visual y verifica los servicios conectados.</p>
      </header>

      {/* ── Section: Apariencia ── */}
      <section className="config-section">
        <h2 className="config-section__title">Apariencia</h2>

        <div className="config-card">
          <div className="theme-toggle">
            <div className="theme-toggle__info">
              <span className="theme-toggle__icon">{darkMode ? '🌙' : '☀️'}</span>
              <div>
                <p className="theme-toggle__label">Tema {darkMode ? 'oscuro' : 'claro'}</p>
                <p className="theme-toggle__hint">
                  Cambia entre modo claro y oscuro para mayor comodidad visual.
                </p>
              </div>
            </div>

            <button
              className={`toggle-switch ${darkMode ? 'toggle-switch--on' : ''}`}
              onClick={() => setDarkMode(d => !d)}
              aria-label="Cambiar tema"
              role="switch"
              aria-checked={darkMode}
            >
              <span className="toggle-switch__thumb" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Section: Estado de servicios ── */}
      <section className="config-section">
        <div className="config-section__header-row">
          <h2 className="config-section__title">Estado de servicios</h2>
          <button
            className="config-refresh-btn"
            onClick={fetchHealth}
            disabled={refreshing}
            title="Verificar servicios"
          >
            <span className={`refresh-icon ${refreshing ? 'spin' : ''}`}>⟳</span>
            {refreshing ? 'Verificando…' : 'Verificar'}
          </button>
        </div>

        {lastChecked && (
          <p className="config-last-checked">
            Última verificación: {lastChecked.toLocaleTimeString()}
          </p>
        )}

        <div className="svc-cards">
          {renderServiceCard('Ollama (IA)', '🤖', health.ollama, (
            <>
              {health.ollama.url && (
                <p className="svc-detail"><span>URL:</span> {health.ollama.url}</p>
              )}
              {health.ollama.model && (
                <p className="svc-detail"><span>Modelo activo:</span> {health.ollama.model}</p>
              )}
              {health.ollama.availableModels && health.ollama.availableModels.length > 0 && (
                <p className="svc-detail">
                  <span>Modelos disponibles:</span> {health.ollama.availableModels.join(', ')}
                </p>
              )}
              {health.ollama.error && (
                <p className="svc-detail svc-detail--error">{health.ollama.error}</p>
              )}
            </>
          ))}

          {renderServiceCard('Transcripción (Whisper)', '🎙️', health.transcription, (
            <>
              {health.transcription.whisperModel && (
                <p className="svc-detail">
                  <span>Modelo Whisper:</span> {health.transcription.whisperModel}
                </p>
              )}
              {health.transcription.device && (
                <p className="svc-detail">
                  <span>Dispositivo:</span> {health.transcription.device === 'cpu' ? 'CPU' : 'GPU (CUDA)'}
                </p>
              )}
              {health.transcription.error && (
                <p className="svc-detail svc-detail--error">{health.transcription.error}</p>
              )}
            </>
          ))}

          {renderServiceCard('Base de datos (PostgreSQL)', '🗄️', health.database, (
            <>
              {health.database.database && (
                <p className="svc-detail"><span>Versión:</span> {health.database.database}</p>
              )}
              {health.database.url && (
                <p className="svc-detail"><span>URL:</span> {health.database.url}</p>
              )}
              {health.database.error && (
                <p className="svc-detail svc-detail--error">{health.database.error}</p>
              )}
            </>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConfiguracionPage;
