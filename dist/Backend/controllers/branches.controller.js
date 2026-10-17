"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editBranch = exports.removeBranch = exports.createNewBranch = exports.fetchBranchById = exports.fetchAllBranches = void 0;
const branches_model_1 = require("../models/branches.model");
/**
 * Fetch all branch offices
 */
const fetchAllBranches = async (req, res) => {
    try {
        // 1. Execute model query to fetch all branches
        const branches = await (0, branches_model_1.getAllBranches)();
        return res.status(200).json({
            success: true,
            data: branches,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.fetchAllBranches = fetchAllBranches;
/**
 * Retrieve a single branch by ID
 */
const fetchBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branchId = Number(id);
        if (isNaN(branchId)) {
            return res.status(400).json({ success: false, message: 'Invalid branch ID format.' });
        }
        const branch = await (0, branches_model_1.getBranchById)(branchId);
        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found.' });
        }
        return res.status(200).json({
            success: true,
            data: branch,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.fetchBranchById = fetchBranchById;
/**
 * Create a new branch
 */
const createNewBranch = async (req, res) => {
    try {
        const { name, code } = req.body;
        if (!name || typeof name !== 'string' || !code || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Both "name" and "code" are required and must be strings.',
            });
        }
        const newBranch = await (0, branches_model_1.createBranch)(name.trim(), code.trim());
        return res.status(201).json({
            success: true,
            data: newBranch,
            message: 'Branch created successfully.',
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.createNewBranch = createNewBranch;
/**
 * Remove a branch by ID
 */
const removeBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const branchId = Number(id);
        if (isNaN(branchId)) {
            return res.status(400).json({ success: false, message: 'Invalid branch ID format.' });
        }
        const deletedBranch = await (0, branches_model_1.deleteBranch)(branchId);
        if (!deletedBranch) {
            return res.status(404).json({ success: false, message: 'Branch not found.' });
        }
        return res.status(200).json({
            success: true,
            message: 'Branch deleted successfully.',
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.removeBranch = removeBranch;
/**
 * Update a branch record by ID
 */
const editBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;
        // 1. Validate ID param
        const branchId = Number(id);
        if (isNaN(branchId)) {
            return res.status(400).json({ success: false, message: 'Invalid branch ID format.' });
        }
        // 2. Validate request body parameters
        if (!name || typeof name !== 'string' || !code || typeof code !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Both "name" and "code" are required fields and must be strings.',
            });
        }
        // 3. Execute model update query
        const updatedBranch = await (0, branches_model_1.updateBranch)(branchId, name.trim(), code.trim());
        // 4. Handle non-existent resource
        if (!updatedBranch) {
            return res.status(404).json({ success: false, message: `Branch with ID ${branchId} not found.` });
        }
        // 5. Send success response
        return res.status(200).json({
            success: true,
            data: updatedBranch,
            message: 'Branch updated successfully.',
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error),
        });
    }
};
exports.editBranch = editBranch;
