import { Request, Response } from 'express';
import {
  getInstallationByWarrantyId,
  createInstallation,
  updateInstallationItemPartial,
  updateInstallation,
  deleteInstallation,
  InstallationItem,
  Installation,
} from '../models/installations.model'; 


/**
 * Get installation details by warranty ID
 * GET /api/installations/warranty/:warranty_id
 */
export const getByWarrantyId = async (
  req: Request<{ warranty_id: string }>,
  res: Response
): Promise<void> => {
  try {
    const warrantyId = parseInt(req.params.warranty_id, 10);

    if (isNaN(warrantyId)) {
      res.status(400).json({ error: 'Invalid warranty_id parameter' });
      return;
    }

    const installation = await getInstallationByWarrantyId(warrantyId);

    if (!installation) {
      res.status(404).json({ message: 'Installation not found for this warranty item' });
      return;
    }

    res.status(200).json({ data: installation });
  } catch (error) {
    console.error('Error fetching installation by warranty ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/*
 * Create a new installation record
 
 */
export const create = async (
  req: Request<
    {},
    {},
    {
      warranty_item_id: number;
      version: string;
      size: string;
      installation_date: string | Date;
      notes: string;
    }
  >,
  res: Response
): Promise<void> => {
  try {
    const { warranty_item_id, version, size, installation_date, notes } = req.body;

    // Required fields validation
    if (!warranty_item_id || !version || !size || !installation_date) {
      res.status(400).json({
        error: 'Missing required fields: warranty_item_id, version, size, and installation_date are required.',
      });
      return;
    }

    const parsedDate = new Date(installation_date);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format for installation_date' });
      return;
    }

    const newInstallation = await createInstallation(
      warranty_item_id,
      version,
      size,
      parsedDate,
      notes || ''
    );

    res.status(201).json({
      message: 'Installation created successfully',
      data: newInstallation,
    });
  } catch (error) {
    console.error('Error creating installation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Partial update for installation item
 * PATCH /api/installation-items/:id
 */
export const updateItem = async (
  req: Request<{ id: string }, {}, Partial<InstallationItem>>,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid installation item ID' });
      return;
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: 'No update payload provided' });
      return;
    }

    const updatedItem = await updateInstallationItemPartial(id, req.body);

    if (!updatedItem) {
      res.status(404).json({
        error: 'Installation item not found or no valid fields were provided for update',
      });
      return;
    }

    res.status(200).json({
      message: 'Installation item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error updating installation item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Partial update for installation record
 * PATCH /api/installations/:id
 */
export const update = async (
  req: Request<
    { id: string },
    {},
    Partial<Omit<Installation, 'id' | 'warranty_item_id' | 'created_at' | 'updated_at'>>
  >,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid installation ID' });
      return;
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: 'No update payload provided' });
      return;
    }

    const updatedInstallation = await updateInstallation(id, req.body);

    if (!updatedInstallation) {
      res.status(404).json({
        error: 'Installation record not found or no valid fields were provided for update',
      });
      return;
    }

    res.status(200).json({
      message: 'Installation updated successfully',
      data: updatedInstallation,
    });
  } catch (error) {
    console.error('Error updating installation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete installation record
 * DELETE /api/installations/:id
 */
export const remove = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid installation ID' });
      return;
    }

    const deletedInstallation = await deleteInstallation(id);

    if (!deletedInstallation) {
      res.status(404).json({ error: 'Installation record not found' });
      return;
    }

    res.status(200).json({
      message: 'Installation record deleted successfully',
      data: deletedInstallation,
    });
  } catch (error) {
    console.error('Error deleting installation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};