import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { inboxService } from '@features/inbox/services/inboxService';
import { useAuth } from '../../features/auth/AuthContext';
import { useInFlight } from '../../features/inbox/context/InFlightContext';

interface LayoutProps {
  children: React.ReactNode;
}

/* ---- SVG icons ---- */
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.85A3 3 0 016.5 9a3 3 0 012-2.83V4.5A2.5 2.5 0 019.5 2z" />
    <path d="M14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.85A3 3 0 0117.5 9a3 3 0 00-2-2.83V4.5A2.5 2.5 0 0014.5 2z" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="3" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="21" />
    <line x1="3" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="21" y2="12" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function Layout({ children }: Readonly<LayoutProps>) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { items: inFlightItems } = useInFlight();

  useEffect(() => {
    inboxService.countPending()
      .then(setPendingCount)
      .catch(() => setPendingCount(0));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U';
  const displayName = user?.displayName || user?.username || 'Usuario';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__avatar">{initial}</div>
          <div className="sidebar__brand-text">
            <span className="sidebar__brand-name">{displayName}</span>
            <span className="sidebar__brand-sub">Cerebro Digital</span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="sidebar__nav">
          <NavLink
            to="/inbox"
            className={({ isActive }) =>
              'sidebar__nav-item' + (isActive ? ' active' : '')
            }
          >
            <InboxIcon />
            <span>Inbox</span>
            {pendingCount > 0 && (
              <span className="sidebar__badge">{pendingCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/cerebro"
            className={({ isActive }) =>
              'sidebar__nav-item' + (isActive ? ' active' : '')
            }
          >
            <BrainIcon />
            <span>Cerebro</span>
          </NavLink>

          <NavLink
            to="/mapa"
            className={({ isActive }) =>
              'sidebar__nav-item' + (isActive ? ' active' : '')
            }
          >
            <MapIcon />
            <span>Mapa</span>
          </NavLink>

          <NavLink
            to="/calendario"
            className={({ isActive }) =>
              'sidebar__nav-item' + (isActive ? ' active' : '')
            }
          >
            <CalendarIcon />
            <span>Calendario</span>
          </NavLink>
        </nav>

        {/* In-flight processing queue */}
        {inFlightItems.length > 0 && (
          <div className="sidebar__inflight">
            <div className="sidebar__inflight-title">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.46 2.5 2.5 0 01-1.07-4.85A3 3 0 016.5 9a3 3 0 012-2.83V4.5A2.5 2.5 0 019.5 2z" />
                <path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96-.46 2.5 2.5 0 001.07-4.85A3 3 0 0017.5 9a3 3 0 00-2-2.83V4.5A2.5 2.5 0 0014.5 2z" />
              </svg>
              Actividad IA
            </div>
            {inFlightItems.map(item => (
              <div key={item.id} className="sidebar__inflight-item">
                <div className="sidebar__inflight-spinner" />
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span className="sidebar__inflight-label">{item.label}</span>
                  <span className="sidebar__inflight-text">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer nav */}
        <div className="sidebar__footer">
          <NavLink
            to="/configuracion"
            className={({ isActive }) =>
              'sidebar__nav-item' + (isActive ? ' active' : '')
            }
          >
            <SettingsIcon />
            <span>Configuración</span>
          </NavLink>

          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              'sidebar__nav-item' + (isActive ? ' active' : '')
            }
          >
            <UserIcon />
            <span>Perfil</span>
          </NavLink>

          {user && (
            <button className="sidebar__nav-item sidebar__logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/inbox" className={({ isActive }) => 'mobile-nav-item' + (isActive ? ' active' : '')}>
          <InboxIcon />
          <span>Inbox</span>
          {pendingCount > 0 && <span className="mobile-nav-badge">{pendingCount}</span>}
        </NavLink>
        <NavLink to="/cerebro" className={({ isActive }) => 'mobile-nav-item' + (isActive ? ' active' : '')}>
          <BrainIcon />
          <span>Cerebro</span>
        </NavLink>
        <NavLink to="/mapa" className={({ isActive }) => 'mobile-nav-item' + (isActive ? ' active' : '')}>
          <MapIcon />
          <span>Mapa</span>
        </NavLink>
        <NavLink to="/calendario" className={({ isActive }) => 'mobile-nav-item' + (isActive ? ' active' : '')}>
          <CalendarIcon />
          <span>Calendario</span>
        </NavLink>
        <NavLink to="/configuracion" className={({ isActive }) => 'mobile-nav-item' + (isActive ? ' active' : '')}>
          <SettingsIcon />
          <span>Ajustes</span>
        </NavLink>
      </nav>
    </div>
  );
}

export default Layout;
