import db from '../config/db.js';

// ==========================================
// 1. Interfaces & Types
// ==========================================

export interface InstallationItem {
  id: number;
  name?: string;
  serial_number?: string;
  status?: string;
  installation_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface Installation {
  id: number;
  warranty_item_id?: number;
  version?: string;
  size?: string;
  installation_date?: Date;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

// ==========================================
// 2. Allowlist Sets for Security
// ==========================================

const ALLOWED_ITEM_COLUMNS: Set<keyof InstallationItem> = new Set([
  'name',
  'serial_number',
  'status',
  'installation_date',
]);

const ALLOWED_INSTALLATION_COLUMNS: Set<keyof Installation> = new Set([
  'version',
  'size',
  'notes',
  'installation_date',
]);

// ==========================================
// 3. Database Functions
// ==========================================

// Get installation details for a specific warranty item
export const getInstallationByWarrantyId = async (warranty_id: number) => {
  const result = await db.query(
    `SELECT * FROM installations WHERE warranty_item_id = $1`,
    [warranty_id]
  );
  return result.rows[0] || null;
};

// Insert a new installation record
export const createInstallation = async (
  warrantyItemId: number,
  version: string,
  size: string,
  installationDate: Date,
  notes: string
) => {
  const result = await db.query(
    `INSERT INTO installations (warranty_item_id, version, size, installation_date, notes) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [warrantyItemId, version, size, installationDate, notes]
  );
  return result.rows[0];
};

// Partial update for installation item
export const updateInstallationItemPartial = async (
  id: number,
  fieldsToUpdate: Partial<InstallationItem>
): Promise<InstallationItem | null> => {
  if (!fieldsToUpdate || typeof fieldsToUpdate !== 'object') return null;

  const entries = Object.entries(fieldsToUpdate).filter(
    ([key, value]) =>
      value !== undefined && ALLOWED_ITEM_COLUMNS.has(key as keyof InstallationItem)
  );

  if (entries.length === 0) return null;

  const setClause = entries
    .map(([key], index) => `"${key}" = $${index + 1}`)
    .join(', ');

  const values = entries.map(([, value]) => value);

  const query = `
    UPDATE installation_items 
    SET ${setClause}, updated_at = NOW() 
    WHERE id = $${entries.length + 1} 
    RETURNING *
  `;

  const result = await db.query(query, [...values, id]);
  return result.rows[0] || null;
};







// Partial update for installation
export const updateInstallation = async (
  id: number,
  updates: Partial<Omit<Installation, 'id' | 'warranty_item_id' | 'created_at' | 'updated_at'>>
): Promise<Installation | null> => {
  if (!updates || typeof updates !== 'object') return null;

  const validEntries = Object.entries(updates).filter(
    ([key, value]) =>
      value !== undefined &&
      ALLOWED_INSTALLATION_COLUMNS.has(key as keyof Installation)
  );

  if (validEntries.length === 0) return null;

  const setClause = validEntries
    .map(([key], i) => `"${key}" = $${i + 1}`)
    .join(', ');

  const values = validEntries.map(([, value]) => value);

  const result = await db.query(
    `UPDATE installations 
     SET ${setClause}, updated_at = NOW() 
     WHERE id = $${validEntries.length + 1} 
     RETURNING *`,
    [...values, id]
  );

  return result.rows[0] || null;
};







// Delete installation record
export const deleteInstallation = async (id: number) => {
  const result = await db.query(
    `DELETE FROM installations WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};