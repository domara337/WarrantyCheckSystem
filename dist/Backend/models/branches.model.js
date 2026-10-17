"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranch = exports.deleteBranch = exports.createBranch = exports.getBranchById = exports.getAllBranches = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
//get all branches
const getAllBranches = async () => {
    const result = await db_js_1.default.query('SELECT * FROM branches ORDER BY id ASC');
    return result.rows;
};
exports.getAllBranches = getAllBranches;
//get branch by id
const getBranchById = async (id) => {
    const result = await db_js_1.default.query('SELECT * FROM branches WHERE id=$1', [id]);
    return result.rows[0];
};
exports.getBranchById = getBranchById;
//Insertting a new branch
const createBranch = async (name, code) => {
    const result = await db_js_1.default.query('INSERT INTO branches(name,code) VALUES($1,$2) RETURNING *', [name, code]);
    return result.rows[0];
};
exports.createBranch = createBranch;
//Delete a branch by id
const deleteBranch = async (id) => {
    const result = await db_js_1.default.query('DELETE FROM branches WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
};
exports.deleteBranch = deleteBranch;
//updates a branch by its id
const updateBranch = async (id, name, code) => {
    try {
        const query = `
      UPDATE branches 
      SET name = $1, code = $2 
      WHERE id = $3 
      RETURNING *;
    `;
        const values = [name, code, id];
        const result = await db_js_1.default.query(query, values);
        // Return null if no row was updated (e.g., non-existent ID)
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    }
    catch (error) {
        console.error(`Error updating branch with ID ${id}:`, error);
        throw error;
    }
};
exports.updateBranch = updateBranch;
