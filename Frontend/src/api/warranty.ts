import { apiClient } from './client';
import type { FullWarrantyRecord, ProductEntry, WarrantyItem, WarrantySearchResult } from '../types';
import { readArrayResponse } from './response';

// Create the warranty and its installation together through the unified entry endpoint.
export const createProductEntry = async (data: ProductEntry) => {
  const res = await apiClient.post('/warranty-items/enter-product', data);
  return res.data;
};

export const createWarranty = async (data: Partial<WarrantyItem>) => {
  const res = await apiClient.post('/warranty-items', data);
  return res.data;
};

export const searchWarranty = async (query: string): Promise<WarrantySearchResult[]> => {
  const res = await apiClient.get<unknown>(`/warranty-items/search?term=${encodeURIComponent(query)}`);
  return readArrayResponse<WarrantySearchResult>(res.data, 'Warranty search');
};

export const getAllWarrantyRecords = async (): Promise<FullWarrantyRecord[]> => {
  const res = await apiClient.get<unknown>('/warranty-items');
  return readArrayResponse<FullWarrantyRecord>(res.data, 'Warranty records');
};

export const updateWarrantyRecord = async (
  id: string | number,
  data: Pick<WarrantyItem, 'serial_number' | 'label_id' | 'warranty_months' | 'warranty_start_date' | 'warranty_end_date'>,
): Promise<void> => {
  await apiClient.patch(`/warranty-items/${id}`, data);
};

export const deleteWarrantyRecord = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/warranty-items/${id}`);
};

// export const uploadWarrantyExcel = async (file: File) => {
//   const formData = new FormData();
//   formData.append('file', file);
//   const res = await apiClient.post('/upload/warranty-items', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return res.data;
// };