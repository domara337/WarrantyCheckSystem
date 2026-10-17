"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.deleteCustomer = exports.createCustomer = exports.findCustomerByPhoneNumber = exports.findCustomerByEmail = exports.getCustomerbyId = exports.getAllCustomers = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
//get all customers
const getAllCustomers = async () => {
    const result = await db_js_1.default.query('SELECT * FROM customers ORDER BY id ASC');
    return result.rows;
};
exports.getAllCustomers = getAllCustomers;
//get customer by id
const getCustomerbyId = async (id) => {
    const result = await db_js_1.default.query('SELECT * FROM customers WHERE id=$1', [id]);
    return result.rows[0];
};
exports.getCustomerbyId = getCustomerbyId;
//find customer by email
const findCustomerByEmail = async (email) => {
    const result = await db_js_1.default.query('SELECT * FROM customers WHERE email=$1', [email]);
    return result.rows[0];
};
exports.findCustomerByEmail = findCustomerByEmail;
//get customer by phone number
const findCustomerByPhoneNumber = async (phone_number) => {
    const result = await db_js_1.default.query('SELECT * FROM customers WHERE mobile=$1', [phone_number]);
    return result.rows[0];
};
exports.findCustomerByPhoneNumber = findCustomerByPhoneNumber;
//Insert a new Customer
const createCustomer = async (full_name, mobile, city, address, contact_person, email) => {
    const result = await db_js_1.default.query('INSERT INTO customers(name,mobile,city,address,contact_person,email) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [full_name, mobile, city, address, contact_person, email]);
    return result.rows[0];
};
exports.createCustomer = createCustomer;
//Delete a customer by id
const deleteCustomer = async (id) => {
    const result = await db_js_1.default.query('DELETE FROM customers WHERE id=$1 RETURNING *', [id]);
    return result.rows[0];
};
exports.deleteCustomer = deleteCustomer;
// Update customer dynamically
const updateCustomer = async (id, fields) => {
    const keys = Object.keys(fields);
    // If no fields are provided to update, return the existing record
    if (keys.length === 0) {
        return (0, exports.getCustomerbyId)(id);
    }
    // Construct "column_name = $1, column_name = $2, ..."
    const setClause = keys
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
    const values = [...Object.values(fields), id];
    const query = `
        UPDATE customers 
        SET ${setClause} 
        WHERE id = $${keys.length + 1} 
        RETURNING *
    `;
    const result = await db_js_1.default.query(query, values);
    return result.rows[0];
};
exports.updateCustomer = updateCustomer;
