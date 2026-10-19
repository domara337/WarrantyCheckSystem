export interface WarrantyItem {
  id?: string | number;
  serial_number: string;
  label_id: string;
  product_id: string | number;
  branch_id: string | number;
  customer_id: string | number;
  warranty_months: number;
  warranty_start_date: string;
  warranty_end_date: string;
  created_by?: number;
}

// Payload for the unified form; the server creates both related records atomically.
export interface ProductEntry {
  serial_number: string;
  label_id: string;
  brand_id: string | number;
  product_id: string | number;
  branch_id: string | number;
  customer_id: string | number;
  warranty_months: number;
  warranty_start_date: string;
  version?: string;
  size?: string;
  installation_date: string;
  notes: string;
}

export interface WarrantySearchResult {
  warranty_id: string | number;
  serial_number: string;
  label_id: string;
  warranty_start_date: string;
  warranty_end_date: string;
  status: 'Active' | 'Expired';
  days_remaining: number;
  part_number: string;
  model_name: string;
  brand_name?: string;
  branch_name: string;
  customer_name: string;
  contact_person?: string;
  customer_mobile?: string;
  installations?: Array<{
    id: number | string;
    version: string;
    size: string;
    installation_date: string;
    notes: string;
  }>;
}

export interface FullWarrantyRecord {
  id: number | string;
  serial_number: string;
  label_id: string;
  brand_id: number | string;
  product_id: number | string;
  branch_id: number | string;
  customer_id: number | string | null;
  warranty_months: number;
  warranty_start_date: string;
  warranty_end_date: string;
  status?: string;
  model_name: string;
  part_number: string;
  branch_name: string;
  customer_name: string | null;
  customer_mobile: string | null;
  installations: Array<{
    id: number | string;
    version: string;
    size: string;
    installation_date: string;
    notes: string;
  }>;
}