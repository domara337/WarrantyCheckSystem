"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInstallation = exports.updateInstallation = exports.updateInstallationItemPartial = exports.createInstallation = exports.getInstallationByWarrantyId = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
// ==========================================
// 2. Allowlist Sets for Security
// ==========================================
const ALLOWED_ITEM_COLUMNS = new Set([
    'name',
    'serial_number',
    'status',
    'installation_date',
]);
const ALLOWED_INSTALLATION_COLUMNS = new Set([
    'version',
    'size',
    'notes',
    'installation_date',
]);
// ==========================================
// 3. Database Functions
// ==========================================
// Get installation details for a specific warranty item
const getInstallationByWarrantyId = async (warranty_id) => {
    const result = await db_js_1.default.query(`SELECT * FROM installations WHERE warranty_item_id = $1`, [warranty_id]);
    return result.rows[0] || null;
};
exports.getInstallationByWarrantyId = getInstallationByWarrantyId;
// Insert a new installation record
const createInstallation = async (warrantyItemId, version, size, installationDate, notes) => {
    const result = await db_js_1.default.query(`INSERT INTO installations (warranty_item_id, version, size, installation_date, notes) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`, [warrantyItemId, version, size, installationDate, notes]);
    return result.rows[0];
};
exports.createInstallation = createInstallation;
// Partial update for installation item
const updateInstallationItemPartial = async (id, fieldsToUpdate) => {
    if (!fieldsToUpdate || typeof fieldsToUpdate !== 'object')
        return null;
    const entries = Object.entries(fieldsToUpdate).filter(([key, value]) => value !== undefined && ALLOWED_ITEM_COLUMNS.has(key));
    if (entries.length === 0)
        return null;
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
    const result = await db_js_1.default.query(query, [...values, id]);
    return result.rows[0] || null;
};
exports.updateInstallationItemPartial = updateInstallationItemPartial;
// Partial update for installation
const updateInstallation = async (id, updates) => {
    if (!updates || typeof updates !== 'object')
        return null;
    const validEntries = Object.entries(updates).filter(([key, value]) => value !== undefined &&
        ALLOWED_INSTALLATION_COLUMNS.has(key));
    if (validEntries.length === 0)
        return null;
    const setClause = validEntries
        .map(([key], i) => `"${key}" = $${i + 1}`)
        .join(', ');
    const values = validEntries.map(([, value]) => value);
    const result = await db_js_1.default.query(`UPDATE installations 
     SET ${setClause}, updated_at = NOW() 
     WHERE id = $${validEntries.length + 1} 
     RETURNING *`, [...values, id]);
    return result.rows[0] || null;
};
exports.updateInstallation = updateInstallation;
// Delete installation record
const deleteInstallation = async (id) => {
    const result = await db_js_1.default.query(`DELETE FROM installations WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0] || null;
};
exports.deleteInstallation = deleteInstallation;
