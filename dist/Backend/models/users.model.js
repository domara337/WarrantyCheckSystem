"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserById = exports.getAllStaffUsers = exports.getAllUsers = exports.createUser = exports.findUserByEmail = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
//find user by email
const findUserByEmail = async (email) => {
    const result = await db_js_1.default.query('SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))', [email]);
    return result.rows[0];
};
exports.findUserByEmail = findUserByEmail;
//create new user
const createUser = async (fullname, email, hashedPassword, role, branchId) => {
    const result = await db_js_1.default.query('INSERT INTO users(full_name,email,password_hash,role,branch_id) VALUES($1,$2,$3,$4,$5) RETURNING *', [fullname, email, hashedPassword, role, branchId]);
    return result.rows[0];
};
exports.createUser = createUser;
//get all users
const getAllUsers = async () => {
    const result = await db_js_1.default.query('SELECT * FROM users');
    return result.rows;
};
exports.getAllUsers = getAllUsers;
//get all staff users
const getAllStaffUsers = async () => {
    const result = await db_js_1.default.query('SELECT u.id, u.full_name,u.email,u.role,u.branch_id,b.name as branch_name FROM usres u LEFT JOIN branches b ON u.branch_id=b.id');
    return result.rows;
};
exports.getAllStaffUsers = getAllStaffUsers;
// Get single user by ID
const getUserById = async (id) => {
    const result = await db_js_1.default.query("SELECT id, full_name, email, role, branch_id FROM users WHERE id = $1", [id]);
    return result.rows[0];
};
exports.getUserById = getUserById;
// Delete user by ID
const deleteUser = async (id) => {
    const result = await db_js_1.default.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};
exports.deleteUser = deleteUser;
