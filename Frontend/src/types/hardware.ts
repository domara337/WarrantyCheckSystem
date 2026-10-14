export interface Branch {
  id: number;
  name: string;
  code: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Product {
  id: number | string;
  part_number: string;
  brand_id: number;
  model_name: string;
  category?: string;
  
}

export interface Customer {
  id: string | number;
  name: string;
  mobile?: string;
  city?: string;
  address?: string;
  contact_person?: string;
  email?: string;
}

export interface Installation {
  id?: number | string;
  warranty_item_id: number | string;
  version: string;
  size: string;
  installation_date: string;
  notes: string;
}