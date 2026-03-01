import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Idea } from '../mockData';

interface IdeaPopupProps {
  idea: Idea;
  accentColor?: string;
  onClose: () => void;
  onNavigate: (idea: Idea) => void;
}

export const IdeaPopup: React.FC<IdeaPopupProps> = ({
  idea,
  accentColor = '#43BCCD',
  onClose,
  onNavigate,
}) => {
  const date = new Date(idea.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Detectar si es móvil
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Estilos del panel: lateral en desktop, bottom-sheet en móvil
  const panelStyle: React.CSSProperties = isMobile
    ? {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '70vh',
      zIndex: 50,
      background: 'rgba(10,12,24,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: `1.5px solid ${accentColor}33`,
      borderRadius: '18px 18px 0 0',
      boxShadow: `0 -8px 40px rgba(0,0,0,0.45)`,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInBottom 0.3s cubic-bezier(0.22,1,0.36,1)',
      overflowY: 'auto',
    }
    : {
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      width: 'min(340px, 85vw)',
      zIndex: 50,
      background: 'rgba(10,12,24,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderLeft: `1.5px solid ${accentColor}33`,
      boxShadow: `-8px 0 40px rgba(0,0,0,0.45)`,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.25s cubic-bezier(0.22,1,0.36,1)',
      overflowY: 'auto',
    };

  return (
    <>
      {/* Panel — lateral en desktop, bottom-sheet en móvil */}
      <div
        style={panelStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle para móvil */}
        {isMobile && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 0 4px',
            flexShrink: 0,
          }}>
            <div style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.25)',
            }} />
          </div>
        )}

        {/* Barra de color superior */}
        <div style={{
          height: 3,
          background: `linear-gradient(to right, ${accentColor}, ${accentColor}44)`,
          flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '20px 20px 0',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 9, height: 9, borderRadius: '50%',
              background: accentColor,
              boxShadow: `0 0 8px ${accentColor}88`,
              flexShrink: 0,
              marginTop: 2,
            }} />
            <h2 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: '#f0f0f0',
              lineHeight: 1.35,
            }}>
              {idea.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            title="Cerrar"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: 'none',
              borderRadius: 7,
              color: '#888',
              cursor: 'pointer',
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 14,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.14)';
              (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLButtonElement).style.color = '#888';
            }}
          >
            ✕
          </button>
        </div>

        {/* Resumen / excerpt — barra destacada bajo el header */}
        <div style={{
          margin: '14px 20px 0',
          padding: '10px 14px',
          borderRadius: 10,
          background: `${accentColor}12`,
          borderLeft: `3px solid ${accentColor}`,
          flexShrink: 0,
        }}>
          <p style={{ margin: 0, fontSize: 13, color: '#c8c8dc', lineHeight: 1.6, fontStyle: 'italic' }}>
            {idea.excerpt}
          </p>
        </div>

        {/* Divider */}
        <div style={{
          height: 1,
          margin: '14px 20px 0',
          background: `linear-gradient(to right, ${accentColor}44, transparent)`,
          flexShrink: 0,
        }} />

        {/* Cuerpo */}
        <div style={{ flex: 1, padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {idea.tagPaths.map(tp => (
              <span key={tp} style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '3px 9px',
                borderRadius: 20,
                background: `${accentColor}1a`,
                border: `1px solid ${accentColor}44`,
                color: accentColor,
                letterSpacing: 0.3,
              }}>
                {tp.split('/').pop()}
              </span>
            ))}
          </div>

          {/* Fecha */}
          <p style={{ margin: 0, fontSize: 11.5, color: '#555' }}>
            {date}
          </p>

          {/* AI Summary (markdown) */}
          {idea.aiSummary && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 12,
              fontSize: 12.5,
              color: '#a0a0b8',
              lineHeight: 1.7,
              overflow: 'auto',
              maxHeight: 520,
            }}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <p style={{ margin: '6px 0 2px', fontSize: 13, fontWeight: 700, color: '#d0d0e8' }}>{children}</p>,
                  h2: ({ children }) => <p style={{ margin: '6px 0 2px', fontSize: 12.5, fontWeight: 700, color: '#c8c8e0' }}>{children}</p>,
                  h3: ({ children }) => <p style={{ margin: '4px 0 2px', fontSize: 12, fontWeight: 600, color: '#b8b8d8' }}>{children}</p>,
                  p: ({ children }) => <p style={{ margin: '4px 0', color: '#a0a0b8' }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ color: '#d8d8f0', fontWeight: 600 }}>{children}</strong>,
                  ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: 16 }}>{children}</ul>,
                  li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                }}
              >
                {idea.aiSummary}
              </ReactMarkdown>
            </div>
          )}

          {/* Botón navegar */}
          <button
            onClick={() => onNavigate(idea)}
            style={{
              marginTop: 12,
              marginBottom: isMobile ? 80 : 24,
              padding: '11px 0',
              borderRadius: 12,
              border: 'none',
              background: accentColor,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 14px ${accentColor}44`,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
          >
            Ver nota completa →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0 }
          to   { transform: translateX(0);    opacity: 1 }
        }
        @keyframes slideInBottom {
          from { transform: translateY(100%); opacity: 0 }
          to   { transform: translateY(0);    opacity: 1 }
        }
      `}</style>
    </>
  );
};
