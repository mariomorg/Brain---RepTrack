export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
