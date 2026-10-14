import { Request, Response } from 'express';
import {
  getAllBranches,
  getBranchById,
  createBranch,
  deleteBranch,
  updateBranch
} from '../models/branches.model';




/**
 * Fetch all branch offices
 */
export const fetchAllBranches = async (req: Request, res: Response): Promise<Response> => {
  try {
    const branches = await getAllBranches();
    return res.status(200).json({
      success: true,
      data: branches,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};




/**
 * Retrieve a single branch by ID
 */
export const fetchBranchById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const branchId = Number(id);

    if (isNaN(branchId)) {
      return res.status(400).json({ success: false, message: 'Invalid branch ID format.' });
    }

    const branch = await getBranchById(branchId);

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    return res.status(200).json({
      success: true,
      data: branch,
    });
  

} catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};



/**
 * Create a new branch
 */
export const createNewBranch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, code } = req.body;

    if (!name || typeof name !== 'string' || !code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Both "name" and "code" are required and must be strings.',
      });
    }

    const newBranch = await createBranch(name.trim(), code.trim());

    return res.status(201).json({
      success: true,
      data: newBranch,
      message: 'Branch created successfully.',
    });

} catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Remove a branch by ID
 */
export const removeBranch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const branchId = Number(id);

    if (isNaN(branchId)) {
      return res.status(400).json({ success: false, message: 'Invalid branch ID format.' });
    }

    const deletedBranch = await deleteBranch(branchId);

    if (!deletedBranch) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Branch deleted successfully.',
    });

} catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Update a branch record by ID
 */
export const editBranch = async (req: Request, res: Response): Promise<Response> => {
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
    const updatedBranch = await updateBranch(branchId, name.trim(), code.trim());

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
  

} catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};