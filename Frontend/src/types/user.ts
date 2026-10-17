export interface User {
  id: number | string;
  full_name: string;
  email: string;
  role: string;
  branch_id?: number | null;
}

export const normalizeRole = (role: string): string => {
  const normalizedRole = role.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return normalizedRole === 'super_admin' ? 'admin' : normalizedRole;
};

export interface AuthResponse {
  token: string;
  user: User;
}