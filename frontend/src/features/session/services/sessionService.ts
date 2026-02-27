import apiClient from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/common.types';
import type { Session, SessionRequest } from '../types/session.types';

export const sessionService = {
  getAll: () =>
    apiClient.get<ApiResponse<Session[]>>('/sessions').then((r) => r.data.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<Session>>(`/sessions/${id}`).then((r) => r.data.data),

  getByUser: (userId: number) =>
    apiClient
      .get<ApiResponse<Session[]>>(`/sessions/user/${userId}`)
      .then((r) => r.data.data),

  create: (data: SessionRequest) =>
    apiClient.post<ApiResponse<Session>>('/sessions', data).then((r) => r.data.data),

  remove: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/sessions/${id}`),
};
