import db from '../config/db.js';

// Types/Interfaces
export interface SearchWarrantyItemResult {
  warranty_id: number;
  serial_number: string;
  label_id: string;
  warranty_start_date: Date;
  warranty_end_date: Date;
  status: string;
  days_remaining: number;
  part_number: string;
  model_name: string;
  branch_name: string;
  customer_name: string | null;
  contact_person: string | null;
  customer_mobile: string | null;
}

export interface WarrantyItem {
  id: number;
  serial_number: string;
  label_id: string;
  product_id: number;
  branch_id: number;
  customer_id: number | null;
  warranty_months: number;
  warranty_start_date: Date;
  warranty_end_date: Date;
  created_at: Date;
  updated_at?: Date;
  status?: string;
}

// Main search function to get warranty items based on search criteria (serial number, part number, sticker code, or customer name)
export const searchWarrantyItems = async (searchTerm: string): Promise<SearchWarrantyItemResult[]> => {
  const query = `%${searchTerm.trim()}%`;

  const result = await db.query(
    `SELECT 
      w.id as warranty_id,
      w.serial_number,
      w.label_id,
      w.warranty_start_date,
      w.warranty_end_date,
      w.status,
      (w.warranty_end_date - CURRENT_DATE) as days_remaining,
      p.part_number,
      p.model_name,
      b.name as branch_name,
      c.name as customer_name,
      c.contact_person,
      c.mobile as customer_mobile
    FROM warranty_items w
    JOIN products p ON w.product_id = p.id
    JOIN branches b ON w.branch_id = b.id
    LEFT JOIN customers c ON w.customer_id = c.id
    WHERE 
      w.serial_number ILIKE $1 OR
      p.part_number ILIKE $1 OR
      w.label_id ILIKE $1 OR
      c.name ILIKE $1
    ORDER BY w.created_at DESC`,
    [query]
  );
  return result.rows;
};

// Find single warranty item by exact serial number
export const getWarrantyItembySerialNumber = async (serial_number: string): Promise<WarrantyItem | null> => {
  const result = await db.query(
    `SELECT * FROM warranty_items WHERE serial_number = $1`,
    [serial_number]
  );
  return result.rows[0] || null;
};

// Insert a new warranty item
export const CreateWarrantyItem = async (
  serial_number: string,
  label_id: string,
  product_id: number,
  branch_id: number,
  customer_id: number,
  warranty_months: number,
  warranty_start_date: Date,
  warranty_end_date: Date,
  created_at: Date = new Date()
): Promise<WarrantyItem> => {
  const result = await db.query(
    `INSERT INTO warranty_items (
      serial_number,
      label_id,
      product_id,
      branch_id,
      customer_id,
      warranty_months,
      warranty_start_date,
      warranty_end_date,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [
      serial_number,
      label_id,
      product_id,
      branch_id,
      customer_id,
      warranty_months,
      warranty_start_date,
      warranty_end_date,
      created_at,
    ]
  );
  return result.rows[0];
};

// Update a warranty item by id (Dynamic update allowing any subset of fields to be passed)
export const updateWarrantyItemPartial = async (
  id: number,
  fieldsToUpdate: Partial<WarrantyItem>
): Promise<WarrantyItem | null> => {
  const keys = Object.keys(fieldsToUpdate);
  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
  const values = Object.values(fieldsToUpdate);

  const result = await db.query(
    `UPDATE warranty_items SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0] || null;
};

//delete warranty item by id
export const deleteWarrantyItem = async (id: number): Promise<WarrantyItem | null> => {
    const result = await db.query(
        `DELETE FROM warranty_items WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0] || null;
}

