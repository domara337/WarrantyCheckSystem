"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWarrantyItem = exports.updateWarrantyItemPartial = exports.CreateWarrantyItem = exports.getWarrantyItembySerialNumber = exports.searchWarrantyItems = exports.createProductEntry = exports.getAllWarrantyItems = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
const getAllWarrantyItems = async () => {
    const result = await db_js_1.default.query(`SELECT
      w.*,
      p.model_name,
      p.part_number,
      b.name AS branch_name,
      c.name AS customer_name,
      c.mobile AS customer_mobile,
      COALESCE(
        json_agg(
          json_build_object(
            'id', i.id,
            'version', i.version,
            'size', i.size,
            'installation_date', i.installation_date,
            'notes', i.notes
          ) ORDER BY i.installation_date DESC
        ) FILTER (WHERE i.id IS NOT NULL),
        '[]'::json
      ) AS installations
    FROM warranty_items w
    JOIN products p ON w.product_id = p.id
    JOIN branches b ON w.branch_id = b.id
    LEFT JOIN customers c ON w.customer_id = c.id
    LEFT JOIN installations i ON i.warranty_item_id = w.id
    GROUP BY w.id, p.model_name, p.part_number, b.name, c.name, c.mobile
    ORDER BY w.created_at DESC`);
    return result.rows;
};
exports.getAllWarrantyItems = getAllWarrantyItems;
// Unified entry uses one PostgreSQL transaction so a failure cannot leave only
// a warranty or only an installation behind.
const createProductEntry = async (entry) => {
    const client = await db_js_1.default.connect();
    let transactionStarted = false;
    try {
        await client.query('BEGIN');
        transactionStarted = true;
        const warrantyResult = await client.query(`INSERT INTO warranty_items (
        serial_number, label_id, product_id, branch_id, customer_id,
        warranty_months, warranty_start_date, warranty_end_date, created_at
      )
      SELECT $1, $2, p.id, $5, $6, $7, $8::date,
        ($8::date + ($7::int * INTERVAL '1 month'))::date, NOW()
      FROM products p
      WHERE p.id = $3 AND p.brand_id = $4
      RETURNING *`, [
            entry.serial_number,
            entry.label_id,
            entry.product_id,
            entry.brand_id,
            entry.branch_id,
            entry.customer_id,
            entry.warranty_months,
            entry.warranty_start_date,
        ]);
        // If no warranty item was created, rollback and return null
        if (warrantyResult.rows.length === 0) {
            await client.query('ROLLBACK');
            transactionStarted = false;
            return null;
        }
        // Insert installation record
        const warrantyItem = warrantyResult.rows[0];
        const installationResult = await client.query(`INSERT INTO installations (
        warranty_item_id, version, size, installation_date, notes
      ) VALUES ($1, $2, $3, $4::date, $5)
      RETURNING *`, [
            warrantyItem.id,
            entry.version ?? '',
            entry.size ?? '',
            entry.installation_date,
            entry.notes,
        ]);
        await client.query('COMMIT');
        transactionStarted = false;
        return {
            warranty: warrantyItem,
            installation: installationResult.rows[0],
        };
    }
    catch (error) {
        if (transactionStarted)
            await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.createProductEntry = createProductEntry;
// Search warranty items by serial number, part number, label ID, customer name, or contact person.
const searchWarrantyItems = async (searchTerm) => {
    // Use ILIKE for case-insensitive search and allow partial matches
    const query = `%${searchTerm.trim()}%`;
    // Use ILIKE for case-insensitive search and allow partial matches
    const result = await db_js_1.default.query(`SELECT 
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
      c.name ILIKE $1 OR
      c.contact_person ILIKE $1
    ORDER BY w.created_at DESC`, [query]);
    return result.rows;
};
exports.searchWarrantyItems = searchWarrantyItems;
// Find single warranty item by exact serial number
const getWarrantyItembySerialNumber = async (serial_number) => {
    const result = await db_js_1.default.query(`SELECT * FROM warranty_items WHERE serial_number = $1`, [serial_number]);
    return result.rows[0] || null;
};
exports.getWarrantyItembySerialNumber = getWarrantyItembySerialNumber;
// Insert a new warranty item
const CreateWarrantyItem = async (serial_number, label_id, product_id, branch_id, customer_id, warranty_months, warranty_start_date, warranty_end_date, created_at = new Date()) => {
    const result = await db_js_1.default.query(`INSERT INTO warranty_items (
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
    RETURNING *`, [
        serial_number,
        label_id,
        product_id,
        branch_id,
        customer_id,
        warranty_months,
        warranty_start_date,
        warranty_end_date,
        created_at,
    ]);
    return result.rows[0];
};
exports.CreateWarrantyItem = CreateWarrantyItem;
// Update a warranty item by id (Dynamic update allowing any subset of fields to be passed)
const updateWarrantyItemPartial = async (id, fieldsToUpdate) => {
    const keys = Object.keys(fieldsToUpdate);
    if (keys.length === 0)
        return null;
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);
    const result = await db_js_1.default.query(`UPDATE warranty_items SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`, [...values, id]);
    return result.rows[0] || null;
};
exports.updateWarrantyItemPartial = updateWarrantyItemPartial;
//delete warranty item by id
const deleteWarrantyItem = async (id) => {
    const client = await db_js_1.default.connect();
    let transactionStarted = false;
    try {
        await client.query('BEGIN');
        transactionStarted = true;
        await client.query('DELETE FROM installations WHERE warranty_item_id = $1', [id]);
        const result = await client.query('DELETE FROM warranty_items WHERE id = $1 RETURNING *', [id]);
        await client.query('COMMIT');
        transactionStarted = false;
        return result.rows[0] || null;
    }
    catch (error) {
        if (transactionStarted)
            await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.deleteWarrantyItem = deleteWarrantyItem;
