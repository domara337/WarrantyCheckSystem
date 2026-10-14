// Import bcrypt to compare and hash staff passwords securely
import bcrypt from "bcrypt";
// Import user model functions to interact with the database
import { findUserByEmail, createUser, getAllUsers,getAllStaffUsers, getUserById, deleteUser } from "../models/users.model";

// Controller to handle user login request
export const login = async (req:any, res:any) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;
    // Query database to check if user exists with provided email
    const user = await findUserByEmail(email);
    // Return 401 error if user is not found in database
    if (!user) return res.status(401).json({ error: "Invalid email or password." });
    // Compare incoming plain password with hashed password stored in DB
    const isMatch = await bcrypt.compare(password, user.password_hash);
    // Return 401 error if password verification fails
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });
    // Respond with success message and user account details(and token if applicable)
const jwt = require('jsonwebtoken');

const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
);

return res.status(200).json({ token, user });

  } catch (error) {
    // Catch server errors and return 500 status code
    return res.status(500).json({
         message: error instanceof Error ?error.message:String(error) });
  }
};

// Controller to register a new internal staff user
export const register = async (req:any, res:any) => {
  try {
    // Extract required user fields from request body
    const { full_name, email, password, role, branch_id } = req.body;
    // Check if account with same email already exists
    const existingUser = await findUserByEmail(email);
    // Return 400 bad request if email is already taken
    if (existingUser) return res.status(400).json({ error: "User email already exists." });
    // Hash the plain text password with a salt factor of 10
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new user into database via model function
    const newUser = await createUser(full_name, email, hashedPassword, role, branch_id);
    // Return 201 created status with newly created user object
    return res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    // Return server error status if insertion fails
    return res.status(500).json({ 
        success:false,
        message: error instanceof Error?error.message:String(error) });
  }
};

// Controller to retrieve all internal staff accounts
export const RetrieveUsers = async (req:any, res:any) => {
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

// Controller to fetch a single user by their ID
export const getUser = async (req:any, res:any) => {
  try {
    // Extract user ID from route parameters
    const { id } = req.params;
    // Query database for user with matching ID
    const user = await getUserById(id);
    // Return 404 error if user is not found
    if (!user) return res.status(404).json({ error: "User not found." });
    // Return user details with 200 OK status
    return res.status(200).json(user);
  } catch (error) {
    // Handle database error and return 500 status code
    return res.status(500).
    json({ 
        success:false,
        message:error instanceof Error ? error.message:String(error)
     });
  }
};

// Controller to remove a staff user account
export const removeUser = async (req:any, res:any) => {
  try {
    // Extract user ID from route parameters
    const { id } = req.params;
    // Delete user from database via model
    const deletedUser = await deleteUser(id);
    // Return 404 error if user ID didn't match any record
    if (!deletedUser) return res.status(404).json({ error: "User not found." });
    // Return confirmation response
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    // Handle database error and return 500 status code
    return res.status(500).json({ 
        success:false,
        message:error instanceof Error?error.message:String(error) });
  }
};