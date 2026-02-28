import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

/**
 * Página intermedia que recoge el JWT del fragmento de URL (#token=...)
 * tras autenticación OAuth2 exitosa con Google.
 *
 * El backend redirige a:
 *   http://localhost:5173/oauth2/callback#token=xxx&userId=yyy&...
 *
 * Los datos vienen en el fragmento (#) — no en query params — para que
 * el token nunca llegue a los logs del servidor ni al header Referer.
 */
export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveAuth } = useAuth();

  useEffect(() => {
    // Primero comprobamos si hay error en query params (ej. email_not_verified)
    const queryError = searchParams.get('error');
    if (queryError) {
      navigate('/login?error=' + queryError, { replace: true });
      return;
    }

    // El token viene en el fragmento (#) — window.location.hash
    const hash = window.location.hash.substring(1); // elimina el '#'
    const params = new URLSearchParams(hash);

    const token       = params.get('token');
    const userId      = params.get('userId');
    const username    = params.get('username');
    const email       = params.get('email');
    const displayName = params.get('displayName');
    const fragmentError = params.get('error');

    if (fragmentError) {
      navigate('/login?error=' + fragmentError, { replace: true });
      return;
    }

    if (token && userId && username && email) {
      saveAuth(token, {
        userId,
        username,
        email,
        displayName: displayName ?? username,
      });
      navigate('/inbox', { replace: true });
    } else {
      navigate('/login?error=oauth2_failed', { replace: true });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '16px',
      color: 'var(--color-text-muted, #888)',
    }}>
      <div style={{ fontSize: '2rem' }}>🧠</div>
      <p>Completando inicio de sesión…</p>
    </div>
  );
}
