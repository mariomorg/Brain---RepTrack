import apiClient from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/common.types';
import type { User, UserRequest } from '../types/user.types';

export const userService = {
  getAll: () =>
    apiClient.get<ApiResponse<User[]>>('/users').then((r) => r.data.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`).then((r) => r.data.data),

  create: (data: UserRequest) =>
    apiClient.post<ApiResponse<User>>('/users', data).then((r) => r.data.data),

  update: (id: number, data: UserRequest) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}`, data).then((r) => r.data.data),

  remove: (id: number) =>
    apiClient.delete<ApiResponse<void>>(`/users/${id}`),
};
