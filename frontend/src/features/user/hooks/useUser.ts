import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types/user.types';

export function useUser(id: number) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .getById(id)
      .then(setUser)
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false));
  }, [id]);

  return { user, loading, error };
}
