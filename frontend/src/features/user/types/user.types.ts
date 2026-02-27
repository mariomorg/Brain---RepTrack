export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface UserRequest {
  username: string;
  email: string;
  password: string;
}
