import { apiClient } from './client';
import type { Branch, Brand, Product, Customer } from '../types/hardware';
import { readArrayResponse } from './response';

//get branches
export const getBranches = async (): Promise<Branch[]> => {
  const res = await apiClient.get<unknown>('/branches');
  return readArrayResponse<Branch>(res.data, 'Branches');
};

//get brands
export const getBrands = async (): Promise<Brand[]> => {
  const res = await apiClient.get<unknown>('/brands');
  return readArrayResponse<Brand>(res.data, 'Brands');
};


export const getProducts = async (): Promise<Product[]> => {
  const res = await apiClient.get<unknown>('/products');
  return readArrayResponse<Product>(res.data, 'Products');
};

// CHANGE: Fetch products filtered by brand_id (for cascading Brand → Product dropdown)
export const getProductsByBrand = async (brandId: number | string): Promise<Product[]> => {
  const res = await apiClient.get<unknown>(`/products/by-brand/${brandId}`);
  return readArrayResponse<Product>(res.data, 'Products by brand');
};

//get customers
export const getCustomers = async (): Promise<Customer[]> => {
  const res = await apiClient.get<unknown>('/customers');
  return readArrayResponse<Customer>(res.data, 'Customers');
};

// Create a new customer.
// The backend's addCustomer reads `full_name` from the request body,
// while GET responses expose the same column as `name`.
export const createCustomer = async (data: {
  full_name: string;
  mobile?: string;
  city?: string;
  address?: string;
  contact_person?: string;
  email?: string;
}): Promise<Customer> => {
  const res = await apiClient.post('/customers', data);
  return res.data.data || res.data;
};