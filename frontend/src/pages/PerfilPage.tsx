import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '@shared/api/apiClient';
import { useAuth } from '../features/auth/AuthContext';
import './PerfilPage.css';

/* ─── Types ───────────────────────────────────────── */
interface ProfileStats {
  totalNotes: number;
  notesByType: Record<string, number>;
  totalTags: number;
  rootTags: number;
  tagsUsed: number;
  totalRelations: number;
  inboxByStatus: Record<string, number>;
  totalInbox: number;
  aiModel: string;
}

/* ─── Helpers ─────────────────────────────────────── */
const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  TEXT:        { icon: '📝', label: 'Texto' },
  LINK:        { icon: '🔗', label: 'Enlace' },
  FILE:        { icon: '📄', label: 'Archivo' },
  AUDIO:       { icon: '🎧', label: 'Audio' },
  VIDEO_REF:   { icon: '🎬', label: 'Video' },
  IDEA:        { icon: '💡', label: 'Idea' },
  VOICE_NOTE:  { icon: '🎙️', label: 'Nota de voz' },
  ARTICLE_REF: { icon: '📰', label: 'Artículo' },
};

const STATUS_LABELS: Record<string, { icon: string; label: string }> = {
  PENDING:            { icon: '⏳', label: 'Pendientes' },
  PROCESSING:         { icon: '⚙️', label: 'Procesando' },
  PROCESSED:          { icon: '✅', label: 'Procesados' },
  AWAITING_APPROVAL:  { icon: '👁️', label: 'Por aprobar' },
  REJECTED:           { icon: '❌', label: 'Rechazados' },
  ARCHIVED:           { icon: '📦', label: 'Archivados' },
};

/* ─── Component ───────────────────────────────────── */
const PerfilPage: React.FC = () => {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, refreshProfile } = useAuth();

  /* Edit profile state */
  const [editing, setEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ProfileStats>('/profile/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const startEditing = () => {
    setEditDisplayName(user?.displayName || '');
    setEditEmail(user?.email || '');
    setEditError('');
    setEditSuccess('');
    setEditing(true);
  };

  const saveProfile = async () => {
    setEditError('');
    setEditSuccess('');
    try {
      await apiClient.put('/auth/profile', {
        displayName: editDisplayName,
        email: editEmail,
      });
      await refreshProfile();
      setEditSuccess('Perfil actualizado correctamente');
      setTimeout(() => { setEditing(false); setEditSuccess(''); }, 1500);
    } catch (err: any) {
      setEditError(err?.response?.data?.error || 'Error al actualizar');
    }
  };

  if (loading) {
    return (
      <div className="perfil-page">
        <div className="perfil-loading">Cargando perfil…</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="perfil-page">
        <div className="perfil-loading">No se pudieron obtener los datos.</div>
      </div>
    );
  }


  return (
    <div className="perfil-page">
      {/* ── Header / Avatar ── */}
      <header className="perfil-hero">
        <div className="perfil-avatar">
          <span className="perfil-avatar__letter">
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="perfil-hero__text">
          <h1>{user?.displayName || user?.username || 'Mi Cerebro Digital'}</h1>
          <p className="perfil-hero__sub">
            @{user?.username || 'usuario'} · {user?.email || ''}
          </p>
          {!editing && (
            <button className="perfil-edit-btn" onClick={startEditing}>✏️ Editar perfil</button>
          )}
        </div>
      </header>

      {/* ── Edit form ── */}
      {editing && (
        <section className="perfil-card perfil-edit-card">
          <h2 className="perfil-card__title">Editar perfil</h2>
          {editError && <div className="perfil-edit-error">{editError}</div>}
          {editSuccess && <div className="perfil-edit-success">{editSuccess}</div>}
          <div className="perfil-edit-form">
            <div className="perfil-edit-field">
              <label htmlFor="editDisplayName">Nombre para mostrar</label>
              <input id="editDisplayName" value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} />
            </div>
            <div className="perfil-edit-field">
              <label htmlFor="editEmail">Email</label>
              <input id="editEmail" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} />
            </div>
            <div className="perfil-edit-actions">
              <button className="perfil-edit-save" onClick={saveProfile}>Guardar</button>
              <button className="perfil-edit-cancel" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </div>
        </section>
      )}

      {/* ── Breakdowns ── */}
      <div className="perfil-grid">
        {/* Notes by type */}
        <section className="perfil-card">
          <h2 className="perfil-card__title">Recursos por tipo</h2>
          {Object.keys(stats.notesByType).length === 0 ? (
            <p className="perfil-card__empty">Sin recursos aún.</p>
          ) : (
            <div className="perfil-bar-list">
              {Object.entries(stats.notesByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const meta = TYPE_LABELS[type] || { icon: '📄', label: type };
                  const pct = stats.totalNotes > 0
                    ? Math.round((count / stats.totalNotes) * 100)
                    : 0;
                  return (
                    <div className="bar-item" key={type}>
                      <div className="bar-item__label">
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                        <span className="bar-item__count">{count}</span>
                      </div>
                      <div className="bar-item__track">
                        <div
                          className="bar-item__fill"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Inbox by status */}
        <section className="perfil-card">
          <h2 className="perfil-card__title">Inbox</h2>
          <p className="perfil-card__subtitle">
            {stats.totalInbox} elementos totales
          </p>
          {Object.keys(stats.inboxByStatus).length === 0 ? (
            <p className="perfil-card__empty">Inbox vacío.</p>
          ) : (
            <div className="perfil-status-grid">
              {Object.entries(stats.inboxByStatus).map(([status, count]) => {
                const meta = STATUS_LABELS[status] || { icon: '❓', label: status };
                return (
                  <div className="status-chip" key={status}>
                    <span className="status-chip__icon">{meta.icon}</span>
                    <span className="status-chip__count">{count}</span>
                    <span className="status-chip__label">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Tags breakdown */}
        <section className="perfil-card">
          <h2 className="perfil-card__title">Árbol de tags</h2>
          <div className="perfil-tag-stats">
            <div className="tag-stat">
              <span className="tag-stat__value">{stats.rootTags}</span>
              <span className="tag-stat__label">Categorías raíz</span>
            </div>
            <div className="tag-stat">
              <span className="tag-stat__value">{stats.totalTags}</span>
              <span className="tag-stat__label">Tags totales</span>
            </div>
            <div className="tag-stat">
              <span className="tag-stat__value">{stats.tagsUsed}</span>
              <span className="tag-stat__label">Tags en uso</span>
            </div>
          </div>
        </section>

        {/* AI Info */}
        <section className="perfil-card">
          <h2 className="perfil-card__title">Inteligencia Artificial</h2>
          <div className="perfil-ai-info">
            <div className="ai-info-row">
              <span className="ai-info-row__icon">🤖</span>
              <div>
                <p className="ai-info-row__label">Modelo activo</p>
                <p className="ai-info-row__value">{stats.aiModel}</p>
              </div>
            </div>
            <div className="ai-info-row">
              <span className="ai-info-row__icon">✨</span>
              <div>
                <p className="ai-info-row__label">Funciones IA</p>
                <p className="ai-info-row__value">
                  Clasificación, resumen, tags, relaciones
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────── */
function StatBig({ label, value, icon, accent }: Readonly<{
  label: string; value: number; icon: string; accent?: boolean;
}>) {
  return (
    <div className={`stat-big ${accent ? 'stat-big--accent' : ''}`}>
      <span className="stat-big__icon">{icon}</span>
      <span className="stat-big__value">{value}</span>
      <span className="stat-big__label">{label}</span>
    </div>
  );
}

export default PerfilPage;
