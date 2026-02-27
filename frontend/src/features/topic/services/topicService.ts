import apiClient from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/common.types';
import type { Topic, TopicRequest } from '../types/topic.types';

export const topicService = {
  getAll: () =>
    apiClient.get<ApiResponse<Topic[]>>('/topics').then((r) => r.data.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Topic>>(`/topics/${id}`).then((r) => r.data.data),

  create: (data: TopicRequest) =>
    apiClient.post<ApiResponse<Topic>>('/topics', data).then((r) => r.data.data),

  update: (id: number, data: TopicRequest) =>
    apiClient.put<ApiResponse<Topic>>(`/topics/${id}`, data).then((r) => r.data.data),

  remove: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/topics/${id}`),
};
