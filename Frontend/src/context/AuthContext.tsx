import React, { createContext, useContext, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { normalizeRole, type User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const isUser = (value: unknown): value is User =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  (typeof value.id === 'number' || typeof value.id === 'string') &&
  'full_name' in value &&
  typeof value.full_name === 'string' &&
  'email' in value &&
  typeof value.email === 'string' &&
  'role' in value &&
  typeof value.role === 'string' &&
  (!('branch_id' in value) || value.branch_id === null || typeof value.branch_id === 'number');

const loadAuthState = (): AuthState => {
  const token = sessionStorage.getItem('token');
  const storedUser = sessionStorage.getItem('user');

  if (!token || !storedUser) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return { token: null, user: null };
  }

  try {
    const user: unknown = JSON.parse(storedUser);
    if (!isUser(user)) {
      throw new Error('Stored user data is invalid.');
    }

    return { token, user: { ...user, role: normalizeRole(user.role) } };
  } catch {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    return { token: null, user: null };
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>(loadAuthState);

  const login = (newToken: string, newUser: User) => {
    const normalizedUser = { ...newUser, role: normalizeRole(newUser.role) };
    queryClient.clear();
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(normalizedUser));
    setAuthState({ token: newToken, user: normalizedUser });
  };

  const logout = () => {
    queryClient.clear();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setAuthState({ token: null, user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isAuthenticated: !!authState.token && !!authState.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};