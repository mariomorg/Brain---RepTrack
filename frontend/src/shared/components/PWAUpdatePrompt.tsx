import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Shows a small prompt when a new version of the PWA is available,
 * allowing the user to reload and update.
 */
export default function PWAUpdatePrompt() {
    const [showPrompt, setShowPrompt] = useState(false);

    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, registration) {
            // Check for updates every 60 minutes
            if (registration) {
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            }
            console.log(`SW registered: ${swUrl}`);
        },
        onRegisterError(error) {
            console.error('SW registration error:', error);
        },
    });

    useEffect(() => {
        setShowPrompt(needRefresh);
    }, [needRefresh]);

    if (!showPrompt) return null;

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <span style={styles.text}>Nueva versión disponible</span>
                <button style={styles.button} onClick={() => updateServiceWorker(true)}>
                    Actualizar
                </button>
                <button style={styles.dismiss} onClick={() => setShowPrompt(false)}>
                    ✕
                </button>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 10000,
        animation: 'slideUp 0.3s ease-out',
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    },
    text: {
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--color-text-primary, #111827)',
    },
    button: {
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 600,
        color: '#fff',
        background: 'var(--color-primary, #7C3AED)',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
    },
    dismiss: {
        padding: '4px 8px',
        fontSize: 14,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--color-text-muted, #9CA3AF)',
    },
};
