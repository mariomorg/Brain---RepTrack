import { useEffect, useState } from 'react';
import { sessionService } from '../services/sessionService';
import type { Session } from '../types/session.types';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sessionService
      .getAll()
      .then(setSessions)
      .catch(() => setError('Failed to load sessions'))
      .finally(() => setLoading(false));
  }, []);

  return { sessions, loading, error };
}
