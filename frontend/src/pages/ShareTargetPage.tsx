import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { inboxService } from '../features/inbox/services/inboxService';

/**
 * Page that receives content shared from other apps via the Web Share Target API.
 * The OS sends title/text/url as query params → we forward them to the inbox.
 */
export default function ShareTargetPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'editing'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    // Extract shared data from URL params
    const sharedTitle = searchParams.get('title') || '';
    const sharedText = searchParams.get('text') || '';
    const sharedUrl = searchParams.get('url') || '';

    // Build the content string from whatever was shared
    const buildContent = () => {
        const parts: string[] = [];
        if (sharedTitle) parts.push(sharedTitle);
        if (sharedText) parts.push(sharedText);
        if (sharedUrl && !sharedText.includes(sharedUrl)) parts.push(sharedUrl);
        return parts.join('\n\n');
    };

    const [content, setContent] = useState(buildContent);

    // Auto-send if user is logged in
    useEffect(() => {
        if (!user) {
            setStatus('editing');
            return;
        }

        const raw = buildContent();
        if (!raw.trim()) {
            setStatus('editing');
            return;
        }

        setStatus('editing'); // Let user review before sending
    }, [user]);

    const handleSend = async () => {
        if (!content.trim()) return;

        setStatus('loading');
        try {
            await inboxService.capture({
                content: content.trim(),
                sourceUrl: sharedUrl || undefined,
                title: sharedTitle || undefined,
                metadata: { source: 'pwa-share-target' },
            });
            setStatus('success');
            // Redirect to inbox after short delay
            setTimeout(() => navigate('/inbox'), 1500);
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err?.response?.data?.message || err.message || 'Error desconocido');
        }
    };

    if (!user) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>🔒</div>
                    <h2 style={styles.title}>Inicia sesión</h2>
                    <p style={styles.subtitle}>
                        Necesitas estar autenticado para guardar contenido compartido.
                    </p>
                    <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
                        Ir a Login
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>✅</div>
                    <h2 style={styles.title}>¡Guardado!</h2>
                    <p style={styles.subtitle}>El contenido se envió a tu Inbox.</p>
                    <p style={{ ...styles.subtitle, fontSize: 13 }}>Redirigiendo...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>❌</div>
                    <h2 style={styles.title}>Error</h2>
                    <p style={styles.subtitle}>{errorMsg}</p>
                    <button style={styles.primaryBtn} onClick={() => setStatus('editing')}>
                        Reintentar
                    </button>
                    <button style={styles.secondaryBtn} onClick={() => navigate('/inbox')}>
                        Ir al Inbox
                    </button>
                </div>
            </div>
        );
    }

    // Editing / Review state
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>📤</div>
                <h2 style={styles.title}>Compartir con RepTrack</h2>

                {sharedTitle && (
                    <div style={styles.field}>
                        <label style={styles.label}>Título</label>
                        <div style={styles.preview}>{sharedTitle}</div>
                    </div>
                )}

                {sharedUrl && (
                    <div style={styles.field}>
                        <label style={styles.label}>URL</label>
                        <div style={{ ...styles.preview, wordBreak: 'break-all' }}>{sharedUrl}</div>
                    </div>
                )}

                <div style={styles.field}>
                    <label style={styles.label}>Contenido</label>
                    <textarea
                        style={styles.textarea}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        placeholder="Escribe o edita el contenido a guardar..."
                    />
                </div>

                <button
                    style={{
                        ...styles.primaryBtn,
                        opacity: status === 'loading' || !content.trim() ? 0.6 : 1,
                    }}
                    onClick={handleSend}
                    disabled={status === 'loading' || !content.trim()}
                >
                    {status === 'loading' ? 'Enviando...' : 'Guardar en Inbox'}
                </button>

                <button style={styles.secondaryBtn} onClick={() => navigate('/inbox')}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

/* ─── Styles ─── */
const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'var(--color-bg, #F9FAFB)',
    },
    card: {
        width: '100%',
        maxWidth: 440,
        background: 'var(--color-surface, #fff)',
        borderRadius: 16,
        padding: 32,
        boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))',
        textAlign: 'center' as const,
    },
    icon: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--color-text-primary, #111827)',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: 'var(--color-text-secondary, #6B7280)',
        marginBottom: 20,
    },
    field: {
        textAlign: 'left' as const,
        marginBottom: 16,
    },
    label: {
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--color-text-secondary, #6B7280)',
        marginBottom: 6,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    },
    preview: {
        fontSize: 14,
        color: 'var(--color-text-primary, #111827)',
        background: 'var(--color-border-light, #F3F4F6)',
        padding: '8px 12px',
        borderRadius: 8,
    },
    textarea: {
        width: '100%',
        padding: '10px 12px',
        fontSize: 14,
        border: '1px solid var(--color-border, #E5E7EB)',
        borderRadius: 8,
        background: 'var(--color-surface, #fff)',
        color: 'var(--color-text-primary, #111827)',
        resize: 'vertical' as const,
        fontFamily: 'inherit',
        outline: 'none',
    },
    primaryBtn: {
        width: '100%',
        padding: '12px 20px',
        fontSize: 15,
        fontWeight: 600,
        color: '#fff',
        background: 'var(--color-primary, #7C3AED)',
        border: 'none',
        borderRadius: 10,
        cursor: 'pointer',
        marginBottom: 10,
    },
    secondaryBtn: {
        width: '100%',
        padding: '10px 20px',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--color-text-secondary, #6B7280)',
        background: 'transparent',
        border: '1px solid var(--color-border, #E5E7EB)',
        borderRadius: 10,
        cursor: 'pointer',
    },
};
