import { apiClient } from './client';
import { readArrayResponse } from './response';
import type { User } from '../types';

export interface UserUpdate {
  full_name: string;
  email: string;
  role: string;
  branch_id: number | null;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<unknown>('/users');
  return readArrayResponse<User>(response.data, 'Users');
};

export const updateUser = async (id: string | number, user: UserUpdate): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
