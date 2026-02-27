export interface Session {
  id: number;
  userId: number;
  username: string;
  topicId: number;
  topicTitle: string;
  repetitions: number;
  notes: string;
  sessionDate: string;
}

export interface SessionRequest {
  userId: number;
  topicId: number;
  repetitions: number;
  notes?: string;
}
