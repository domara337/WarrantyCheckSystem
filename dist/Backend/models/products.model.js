"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProduct = exports.deleteProduct = exports.createProduct = exports.getProductById = exports.getProductByPartNumber = exports.getProductsByBrandId = exports.getProductsWithBrandName = exports.getProducts = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
const getProducts = async () => {
    const result = await db_js_1.default.query(`SELECT * FROM products ORDER BY model_name ASC`);
    return result.rows;
};
exports.getProducts = getProducts;
// get all products with optional brand filter
const getProductsWithBrandName = async (brand) => {
    let query = `
    SELECT p.*, b.name as brand_name 
    FROM products p
    JOIN brands b ON p.brand_id = b.id
  `;
    const values = [];
    if (brand) {
        // ILIKE performs a case-insensitive search matching brand or model
        query += ` WHERE b.name ILIKE $1 OR p.model_name ILIKE $1`;
        values.push(`%${brand}%`);
    }
    query += ` ORDER BY p.model_name ASC`;
    const result = await db_js_1.default.query(query, values);
    return result.rows;
};
exports.getProductsWithBrandName = getProductsWithBrandName;
// ==========================================
// 4. Brand-filtered Queries (CHANGE: added for cascading Brand → Product dropdown)
// ==========================================
// Fetch products filtered by a specific brand_id (used by the unified "Enter Product" form)
const getProductsByBrandId = async (brandId) => {
    const result = await db_js_1.default.query(`SELECT p.*, b.name as brand_name
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     WHERE p.brand_id = $1
     ORDER BY p.model_name ASC`, [brandId]);
    return result.rows;
};
exports.getProductsByBrandId = getProductsByBrandId;
//Find product by exact part number
const getProductByPartNumber = async (part_number) => {
    const result = await db_js_1.default.query('SELECT * FROM products WHERE part_number=$1', [part_number]);
    return result.rows[0];
};
exports.getProductByPartNumber = getProductByPartNumber;
//get product by id
const getProductById = async (id) => {
    const result = await db_js_1.default.query('SELECT * FROM products WHERE id=$1', [id]);
    return result.rows[0];
};
exports.getProductById = getProductById;
//Insert a new product
const createProduct = async (part_number, brand_id, model_name, category) => {
    const result = await db_js_1.default.query('INSERT INTO products(part_number,brand_id,model_name,category) VALUES($1,$2,$3,$4) RETURNING *', [part_number, brand_id, model_name, category]);
    return result.rows[0];
};
exports.createProduct = createProduct;
//Delete a product by id
const deleteProduct = async (id) => {
    const result = await db_js_1.default.query('DELETE FROM products WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
};
exports.deleteProduct = deleteProduct;
//Update a product by id
const UpdateProduct = async (product_id, data) => {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    // Dynamically add fields if they are provided in the payload
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = $${paramIndex}`);
            values.push(value);
            paramIndex++;
        }
    });
    // If no fields are provided to update, return early
    if (fields.length === 0) {
        throw new Error("No fields provided for update.");
    }
    // Append product_id as the final parameter for the WHERE clause
    values.push(product_id);
    const query = `
        UPDATE products 
        SET ${fields.join(", ")}
        WHERE id = $${paramIndex} 
        RETURNING *
    `;
    const result = await db_js_1.default.query(query, values);
    return result.rows[0];
};
exports.UpdateProduct = UpdateProduct;
