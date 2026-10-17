// Import bcrypt to compare and hash staff passwords securely
import bcrypt from "bcrypt";
import { Request, Response } from "express";
// Import user model functions to interact with the database
import { findUserByEmail, createUser, getAllUsers, getUserById, updateUser, deleteUser } from "../models/users.model";

const normalizeRole = (role: unknown): string => {
  if (typeof role !== "string") return "";
  const normalizedRole = role.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return normalizedRole === "super_admin" ? "admin" : normalizedRole;
};

const DATABASE_ROLES: Record<string, string> = {
  technician: "Technician",
  sales: "Sales",
  admin: "Super Admin",
  branch_manager: "Branch Manager",
};

const sameUserId = (left: string, right: string): boolean =>
  left.toLowerCase() === right.toLowerCase();

// Controller to handle user login request
export const login = async (req: Request, res: Response) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    // Query database to check if user exists with provided email
    const user = await findUserByEmail(email.trim().toLowerCase());
    // Return 401 error if user is not found in database
    if (!user) return res.status(401).json({ error: "Invalid email or password." });
    // Compare incoming plain password with hashed password stored in DB
    const isMatch = await bcrypt.compare(password, user.password_hash);
    // Return 401 error if password verification fails
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });
    // Respond with success message and user account details(and token if applicable)
const jwt = require('jsonwebtoken');

const normalizedRole = normalizeRole(user.role);
const token = jwt.sign(
    { id: user.id, email: user.email, role: normalizedRole },
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
);

const { password_hash: _passwordHash, ...safeUser } = user;
return res.status(200).json({ token, user: { ...safeUser, role: normalizedRole } });

  } catch (error) {
    // Catch server errors and return 500 status code
    return res.status(500).json({
         message: error instanceof Error ?error.message:String(error) });
  }
};

// Controller to register a new internal staff user
export const register = async (req: Request, res: Response) => {
  try {
    // Extract required user fields from request body
    const { full_name, email, password } = req.body;
    const storedRole = DATABASE_ROLES.technician;
    if (
      typeof full_name !== "string" || !full_name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || password.length < 8
    ) {
      return res.status(400).json({
        message: "Provide a name, email, and password of at least 8 characters.",
      });
    }
    // Check if account with same email already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);
    // Return 400 bad request if email is already taken
    if (existingUser) return res.status(400).json({ error: "User email already exists." });
    // Hash the plain text password with a salt factor of 10
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new user into database via model function
    const newUser = await createUser(full_name.trim(), normalizedEmail, hashedPassword, storedRole, null);
    const { password_hash: _passwordHash, ...safeUser } = newUser;
    const jwt = require("jsonwebtoken");
    const normalizedRoleValue = normalizeRole(safeUser.role);
    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, role: normalizedRoleValue },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.status(201).json({
      message: "User created successfully",
      token,
      user: { ...safeUser, role: normalizedRoleValue },
    });
  } catch (error) {
    // Return server error status if insertion fails
    return res.status(500).json({ 
        success:false,
        message: error instanceof Error?error.message:String(error) });
  }
};

// Controller to retrieve all internal staff accounts
export const RetrieveUsers = async (_req: Request, res: Response) => {
  try {
    // Fetch user records from database model
    const users = await getAllUsers();
    // Return JSON list of users with status code 200
    return res.status(200).json(users);
  

} catch (error) {
    // Return server error status if database query fails
    return res.status(500).
    json({ 
        success:false,
        message:error instanceof Error ? error.message:String(error)
     });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate UUID format before hitting the DB
    if (typeof id !== "string" || !isValidUserId(id)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    const user = await getUserById(id);
    if (!user) return res.status(404).json({ error: "User not found." });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !isValidUserId(id)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    const { full_name, email, role, branch_id } = req.body;
    const storedRole = typeof role === "string" ? DATABASE_ROLES[normalizeRole(role)] : undefined;
    const branchId = branch_id === null || branch_id === "" ? null : Number(branch_id);
    if (
      typeof full_name !== "string" || !full_name.trim() ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !storedRole ||
      (branchId !== null && (!Number.isInteger(branchId) || branchId < 1))
    ) {
      return res.status(400).json({ error: "Provide a name, valid email, valid role, and optional valid branch." });
    }

    if (req.user && sameUserId(req.user.id, id) && normalizeRole(role) !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own administrator role." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser && !sameUserId(String(existingUser.id), id)) {
      return res.status(409).json({ error: "User email already exists." });
    }

    const updated = await updateUser(id, full_name.trim(), normalizedEmail, storedRole, branchId);
    if (!updated) return res.status(404).json({ error: "User not found." });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

const isValidUserId = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Controller to remove a staff user account
export const removeUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string" || !isValidUserId(id)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }
    if (req.user && sameUserId(req.user.id, id)) {
      return res.status(400).json({ error: "You cannot delete your own account." });
    }
    const deletedUser = await deleteUser(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found." });
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    // Handle database error and return 500 status code
    return res.status(500).json({ 
        success:false,
        message:error instanceof Error?error.message:String(error) });
  }
};