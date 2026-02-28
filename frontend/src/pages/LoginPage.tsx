import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import './AuthPages.css';

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(usernameOrEmail, password);
      navigate('/inbox');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Error al iniciar sesión';
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-logo">🧠</div>
          <h1>Brain-RepTrack</h1>
          <p>Inicia sesión en tu cerebro digital</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="usernameOrEmail">Usuario o email</label>
            <input
              id="usernameOrEmail"
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="tu_usuario o email@ejemplo.com"
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
