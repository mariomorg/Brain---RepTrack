import { useEffect, useState } from 'react';
import { topicService } from '../services/topicService';
import type { Topic } from '../types/topic.types';

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    topicService
      .getAll()
      .then(setTopics)
      .catch(() => setError('Failed to load topics'))
      .finally(() => setLoading(false));
  }, []);

  return { topics, loading, error };
}
