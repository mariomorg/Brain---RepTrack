import React, { useEffect } from 'react';

interface ProcessingNotificationProps {
  open: boolean;
  onClose: () => void;
}

const ProcessingNotification: React.FC<ProcessingNotificationProps> = ({ open, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      right: 24,
      bottom: 24,
      zIndex: 9999,
      background: 'rgba(30, 41, 59, 0.98)',
      color: '#fff',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      padding: '18px 32px',
      fontSize: 16,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minWidth: 260,
      maxWidth: 340,
      pointerEvents: 'auto',
      transition: 'opacity 0.2s',
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
        <circle cx="12" cy="12" r="10" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
        <path d="M12 6v6l4 2" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
      </svg>
      Procesando elemento del inbox…
      <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}>&times;</button>
    </div>
  );
};

export default ProcessingNotification;
