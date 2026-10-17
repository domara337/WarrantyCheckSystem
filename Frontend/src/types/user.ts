export interface User {
  id: number | string;
  full_name: string;
  email: string;
  role: string;
  branch_id?: number | null;
}

export const normalizeRole = (role: string): string =>
  role.trim().toLowerCase().replace(/[\s-]+/g, '_');

export interface AuthResponse {
  token: string;
  user: User;
}