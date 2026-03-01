import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@shared/api/apiClient';

/* ─── Types ─────────────────────────────────── */
export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  saveAuth: (token: string, user: AuthUser) => void;
  loginWithGithub: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'brainreptrack_token';
const USER_KEY  = 'brainreptrack_user';

/* ─── Provider ──────────────────────────────── */
export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [loading, setLoading] = useState(false);

  // Set Authorization header on every request
  useEffect(() => {
    const interceptorId = apiClient.interceptors.request.use((config) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (t) {
        config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    });
    return () => {
      apiClient.interceptors.request.eject(interceptorId);
    };
  }, []);

  const saveAuth = useCallback((authToken: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { usernameOrEmail, password });
      const data = res.data;
      saveAuth(data.token, {
        userId: data.userId,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
      });
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  const register = useCallback(async (
    username: string,
    email: string,
    password: string,
    displayName?: string
  ) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register', {
        username,
        email,
        password,
        displayName: displayName || username,
      });
      const data = res.data;
      saveAuth(data.token, {
        userId: data.userId,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
      });
    } finally {
      setLoading(false);
    }
  }, [saveAuth]);

  // Helpers para obtener la URL base del backend
  const getBackendUrl = () => import.meta.env.VITE_API_BASE_URL
    ? (import.meta.env.VITE_API_BASE_URL as string).replace('/api', '')
    : 'http://localhost:8080';

  // Inicia el flujo OAuth2 con GitHub
  const loginWithGithub = useCallback(() => {
    window.location.href = `${getBackendUrl()}/api/auth/oauth2/github`;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiClient.get('/auth/me');
      const data = res.data;
      const updated: AuthUser = {
        userId: data.id,
        username: data.username,
        email: data.email,
        displayName: data.displayName,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      setUser(updated);
    } catch {
      // Token invalid → logout
      logout();
    }
  }, [token, logout]);

  // Auto-validate token on mount
  useEffect(() => {
    if (token) {
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    user, token, loading, login, register, logout, refreshProfile, saveAuth, loginWithGithub
  }), [user, token, loading, login, register, logout, refreshProfile, saveAuth, loginWithGithub]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────── */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
