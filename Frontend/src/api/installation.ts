import { apiClient } from './client';
import type { Installation } from '../types';

// Create
export const createInstallation = async (data: Partial<Installation>) => {
  const res = await apiClient.post('/installations', data);
  return res.data;
};

// Read (All)
export const getInstallations = async () => {
  const res = await apiClient.get<Installation[]>('/installations');
  return res.data;
};

// Read (Single by ID)
export const getInstallationById = async (id: string | number) => {
  const res = await apiClient.get<Installation>(`/installations/${id}`);
  return res.data;
};

// Update
export const updateInstallation = async (id: string | number, data: Partial<Installation>) => {
  const res = await apiClient.put<Installation>(`/installations/${id}`, data);
  return res.data;
};

// Delete
export const deleteInstallation = async (id: string | number) => {
  const res = await apiClient.delete(`/installations/${id}`);
  return res.data;
};