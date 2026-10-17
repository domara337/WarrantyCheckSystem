"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrand = exports.deleteBrand = exports.createBrand = exports.getBrandByid = exports.getAllBrands = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
//get all brands
const getAllBrands = async () => {
    const result = await db_js_1.default.query('SELECT * FROM brands ORDER BY name ASC');
    return result.rows;
};
exports.getAllBrands = getAllBrands;
//get brand by id
const getBrandByid = async (id) => {
    const result = await db_js_1.default.query('SELECT * FROM brands WHERE id=$1', [id]);
    return result.rows[0];
};
exports.getBrandByid = getBrandByid;
//Insert a new brand
const createBrand = async (name) => {
    const result = await db_js_1.default.query('INSERT INTO brands(name) VALUES($1) RETURNING *', [name]);
    return result.rows[0];
};
exports.createBrand = createBrand;
//Delete a brand by id
const deleteBrand = async (id) => {
    const result = await db_js_1.default.query('DELETE FROM brands WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
};
exports.deleteBrand = deleteBrand;
//update a brand by id
const updateBrand = async (id, name) => {
    const result = await db_js_1.default.query('UPDATE brands SET name=$1 WHERE id=$2 RETURNING *', [name, id]);
    return result.rows[0];
};
exports.updateBrand = updateBrand;
