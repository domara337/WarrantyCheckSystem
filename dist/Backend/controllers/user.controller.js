"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.getUser = exports.RetrieveUsers = exports.register = exports.login = void 0;
// Import bcrypt to compare and hash staff passwords securely
const bcrypt_1 = __importDefault(require("bcrypt"));
// Import user model functions to interact with the database
const users_model_1 = require("../models/users.model");
const normalizeRole = (role) => typeof role === "string" ? role.trim().toLowerCase().replace(/[\s-]+/g, "_") : "";
// Controller to handle user login request
const login = async (req, res) => {
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;
        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        // Query database to check if user exists with provided email
        const user = await (0, users_model_1.findUserByEmail)(email.trim().toLowerCase());
        // Return 401 error if user is not found in database
        if (!user)
            return res.status(401).json({ error: "Invalid email or password." });
        // Compare incoming plain password with hashed password stored in DB
        const isMatch = await bcrypt_1.default.compare(password, user.password_hash);
        // Return 401 error if password verification fails
        if (!isMatch)
            return res.status(401).json({ error: "Invalid email or password." });
        // Respond with success message and user account details(and token if applicable)
        const jwt = require('jsonwebtoken');
        const normalizedRole = normalizeRole(user.role);
        const token = jwt.sign({ id: user.id, email: user.email, role: normalizedRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const { password_hash: _passwordHash, ...safeUser } = user;
        return res.status(200).json({ token, user: { ...safeUser, role: normalizedRole } });
    }
    catch (error) {
        // Catch server errors and return 500 status code
        return res.status(500).json({
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.login = login;
// Controller to register a new internal staff user
const register = async (req, res) => {
    try {
        // Extract required user fields from request body
        const { full_name, email, password, role, branch_id = null } = req.body;
        const allowedRoles = ["technician", "sales", "admin", "branch_manager", "Branch Manager"];
        if (typeof full_name !== "string" || !full_name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || password.length < 8 ||
            typeof role !== "string" || !allowedRoles.includes(role) ||
            (branch_id !== null && (!Number.isInteger(Number(branch_id)) || Number(branch_id) < 1))) {
            return res.status(400).json({
                message: "Provide a name, valid email, password of at least 8 characters, valid role, and optional valid branch.",
            });
        }
        // Check if account with same email already exists
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await (0, users_model_1.findUserByEmail)(normalizedEmail);
        // Return 400 bad request if email is already taken
        if (existingUser)
            return res.status(400).json({ error: "User email already exists." });
        // Hash the plain text password with a salt factor of 10
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Insert new user into database via model function
        const storedRole = role === "branch_manager" ? "Branch Manager" : role;
        const newUser = await (0, users_model_1.createUser)(full_name.trim(), normalizedEmail, hashedPassword, storedRole, branch_id);
        const { password_hash: _passwordHash, ...safeUser } = newUser;
        const jwt = require("jsonwebtoken");
        const normalizedRoleValue = normalizeRole(safeUser.role);
        const token = jwt.sign({ id: safeUser.id, email: safeUser.email, role: normalizedRoleValue }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(201).json({
            message: "User created successfully",
            token,
            user: { ...safeUser, role: normalizedRoleValue },
        });
    }
    catch (error) {
        // Return server error status if insertion fails
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.register = register;
// Controller to retrieve all internal staff accounts
const RetrieveUsers = async (req, res) => {
    try {
        // Fetch user records from database model
        const users = await (0, users_model_1.getAllUsers)();
        // Return JSON list of users with status code 200
        return res.status(200).json(users);
    }
    catch (error) {
        // Return server error status if database query fails
        return res.status(500).
            json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.RetrieveUsers = RetrieveUsers;
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate UUID format before hitting the DB
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ error: "Invalid user ID format." });
        }
        const user = await (0, users_model_1.getUserById)(id);
        if (!user)
            return res.status(404).json({ error: "User not found." });
        return res.status(200).json(user);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getUser = getUser;
// Controller to remove a staff user account
const removeUser = async (req, res) => {
    try {
        // Extract user ID from route parameters
        const { id } = req.params;
        // Delete user from database via model
        const deletedUser = await (0, users_model_1.deleteUser)(id);
        // Return 404 error if user ID didn't match any record
        if (!deletedUser)
            return res.status(404).json({ error: "User not found." });
        // Return confirmation response
        return res.status(200).json({ message: "User deleted successfully." });
    }
    catch (error) {
        // Handle database error and return 500 status code
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.removeUser = removeUser;
