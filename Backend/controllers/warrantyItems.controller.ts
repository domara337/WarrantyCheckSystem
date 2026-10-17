import { Request, Response } from 'express';
import {
  searchWarrantyItems,
  getWarrantyItembySerialNumber,
  CreateWarrantyItem,
  updateWarrantyItemPartial,
  deleteWarrantyItem,
  createProductEntry,
  getAllWarrantyItems,
} from '../models/warranty_items.model';
import type { ProductEntryInput } from '../models/warranty_items.model';

export const getAllWarranties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await getAllWarrantyItems();
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Error fetching warranty items:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching warranty items.' });
  }
};



/**
 * @desc    Search warranty items by search term
 * @route   GET /api/warranties/search?term=xxx
 */
export const searchWarranties = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchTerm = req.query.term as string;

    if (!searchTerm || !searchTerm.trim()) {
      res.status(400).json({ success: false, message: 'Search term query parameter is required.' });
      return;
    }

    const items = await searchWarrantyItems(searchTerm);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error('Error searching warranty items:', error);
    res.status(500).json({ success: false, message: 'Server error while searching warranty items.' });
  }
};

/**
 * @desc    Get single warranty item by serial number
 * @route   GET /api/warranties/serial/:serialNumber
 */
export const getBySerialNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serialNumber} = req.params;

    if (!serialNumber) {
      res.status(400).json({ success: false, message: 'Serial number is required.' });
      return;
    }

    const item = await getWarrantyItembySerialNumber(serialNumber as string);

    if (!item) {
      res.status(404).json({ success: false, message: `Warranty item with serial number '${serialNumber}' not found.` });
      return;
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching warranty item by serial number:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching warranty item.' });
  }
};

/**
 * @desc    Create a new warranty item
 * @route   POST /api/warranties
 */
export const createWarranty = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      serial_number,
      label_id,
      product_id,
      branch_id,
      customer_id,
      warranty_months,
      warranty_start_date,
      warranty_end_date,
    } = req.body;

    // Required fields validation
    if (
      !serial_number ||
      !label_id ||
      !product_id ||
      !branch_id ||
      !customer_id ||
      warranty_months === undefined ||
      !warranty_start_date ||
      !warranty_end_date
    ) {
      res.status(400).json({ success: false, message: 'Please provide all required fields.' });
      return;
    }

    const newItem = await CreateWarrantyItem(
      serial_number,
      label_id,
      product_id,
      branch_id,
      customer_id,
      warranty_months,
      new Date(warranty_start_date),
      new Date(warranty_end_date)
    );

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error('Error creating warranty item:', error);
    res.status(500).json({ success: false, message: 'Server error while creating warranty item.',error: error instanceof Error ? error.message : String(error) });
  }
};

// POST /api/warranty-items/enter-product
// Creates warranty and installation data as one validated operation.
export const createProduct = async (req: Request<{}, {}, ProductEntryInput>, res: Response): Promise<void> => {
  try {
    const {
      serial_number,
      label_id,
      brand_id,
      product_id,
      branch_id,
      customer_id,
      warranty_months,
      warranty_start_date,
      version,
      size,
      installation_date,
      notes,
    } = req.body;

    const positiveInteger = (value: unknown): value is number | string =>
      (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) &&
      Number.isInteger(Number(value)) &&
      Number(value) > 0;
    const validIdentifier = (value: unknown): value is number | string =>
      (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) ||
      (typeof value === 'string' && value.trim().length > 0);
    const validDate = (value: unknown): value is string =>
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
      new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

    const invalidFields: string[] = [];
    if (typeof serial_number !== 'string' || !serial_number.trim()) invalidFields.push('serial_number');
    if (typeof label_id !== 'string' || !label_id.trim()) invalidFields.push('label_id');
    if (!positiveInteger(brand_id)) invalidFields.push('brand_id');
    if (!validIdentifier(product_id)) invalidFields.push('product_id');
    if (!positiveInteger(branch_id)) invalidFields.push('branch_id');
    if (!validIdentifier(customer_id)) invalidFields.push('customer_id');
    if (!positiveInteger(warranty_months)) invalidFields.push('warranty_months');
    if (!validDate(warranty_start_date)) invalidFields.push('warranty_start_date');
    if (version !== undefined && typeof version !== 'string') invalidFields.push('version');
    if (size !== undefined && typeof size !== 'string') invalidFields.push('size');
    if (!validDate(installation_date)) invalidFields.push('installation_date');
    if (notes !== undefined && typeof notes !== 'string') invalidFields.push('notes');

    if (invalidFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid or missing fields: ${invalidFields.join(', ')}.`,
        invalidFields,
      });
      return;
    }

    const result = await createProductEntry({
      serial_number: serial_number.trim(),
      label_id: label_id.trim(),
      brand_id: Number(brand_id),
      product_id: typeof product_id === 'string' ? product_id.trim() : product_id,
      branch_id: Number(branch_id),
      customer_id: typeof customer_id === 'string' ? customer_id.trim() : customer_id,
      warranty_months: Number(warranty_months),
      warranty_start_date,
      version: version?.trim() ?? '',
      size: size?.trim() ?? '',
      installation_date,
      notes: notes?.trim() ?? '',
    });

    if (!result) {
      res.status(400).json({ success: false, message: 'The selected product does not belong to the selected brand.' });
      return;
    }

    res.status(201).json({ success: true, message: 'Product, warranty, and installation created successfully.', data: result });
  } catch (error) {
    console.error('Error creating unified product entry:', error);
    res.status(500).json({ success: false, message: 'Server error while creating product, warranty, and installation.' });
  }
};

/**
 * @desc    Partially update a warranty item by ID
 * @route   PATCH /api/warranties/:id
 */
export const updateWarranty = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const fieldsToUpdate = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid warranty ID provided.' });
      return;
    }

    if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
      res.status(400).json({ success: false, message: 'No fields provided for update.' });
      return;
    }

    const updatedItem = await updateWarrantyItemPartial(id, fieldsToUpdate);

    if (!updatedItem) {
      res.status(404).json({ success: false, message: `Warranty item with ID ${id} not found.` });
      return;
    }

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating warranty item:', error);
    res.status(500).json({ success: false, message: 'Server error while updating warranty item.' });
  }
};





/**
 * @desc    Delete a warranty item by ID
 * @route   DELETE /api/warranties/:id
 */
export const removeWarranty = async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ success: false, message: 'Invalid warranty ID provided.' });
      return;
    }

    const deletedItem = await deleteWarrantyItem(id);

    if (!deletedItem) {
      res.status(404).json({ success: false, message: `Warranty item with ID ${id} not found.` });
      return;
    }

    res.status(200).json({ success: true, message: 'Warranty item deleted successfully.', data: deletedItem });
  } catch (error) {
    console.error('Error deleting warranty item:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting warranty item.' });
  }
};