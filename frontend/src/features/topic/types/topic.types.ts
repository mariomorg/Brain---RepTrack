export interface Topic {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface TopicRequest {
  title: string;
  description: string;
}
