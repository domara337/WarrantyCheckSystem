export interface User {
  id: number | string;
  full_name: string;
  email: string;
  role: 'Branch Manager' | 'technician' | 'sales';
  branch_id?: number | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}