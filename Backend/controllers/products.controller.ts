import { Request, Response } from "express";
// Import product model functions
import {
  getProducts,
  getProductsWithBrandName,
  getProductsByBrandId, // CHANGE: added for cascading Brand → Product dropdown
  getProductByPartNumber,
  getProductById,
  createProduct,
  deleteProduct,
  UpdateProduct
} from "../models/products.model";

// Define parameter interface for routes expecting an ID parameter
interface ProductIdParam {
  id: number;
}

// Define parameter interface for routes expecting a partNumber parameter
interface PartNumberParam {
  partNumber: string;
}

// Controller to retrieve entire product master catalog
export const getAllProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Query database for all products
    const products = await getProducts();
    // Send array of products in HTTP response
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

// CHANGE: Controller to retrieve products filtered by brand_id (for cascading dropdown)
export const getProductsByBrand = async (req: Request, res: Response): Promise<Response> => {
  try {
    const brandIdParam = req.params.brandId;
    if (typeof brandIdParam !== "string") {
      return res.status(400).json({ error: "Invalid brand ID." });
    }
    const brandId = parseInt(brandIdParam, 10);

    if (isNaN(brandId)) {
      return res.status(400).json({ error: "Invalid brand ID." });
    }

    const products = await getProductsByBrandId(brandId);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getProductBybrand = async (req: Request, res: Response): Promise<Response> => {
  try {
    // 1. Extract query parameter (e.g. ?brand=hp or ?q=hp e877)
    const brandQuery: unknown = req.query.brand;
    if (brandQuery !== undefined && typeof brandQuery !== "string") {
      return res.status(400).json({ message: "Brand query must be a single string." });
    }
    const brand = typeof brandQuery === "string" ? brandQuery : undefined;

    // 2. Pass the search term to your database query function
    const products = await getProductsWithBrandName(brand);

    if (!products.length) {
      return res.status(404).json({ message: "No products found matching that brand or query." });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      successful: false,
      message: error instanceof Error ? error.message : String(error)
    });
  }
};

// Controller to find a product using part number / SKU
export const getByPartNumber = async (req: Request<PartNumberParam>, res: Response): Promise<Response> => {
  try {
    // Extract partNumber param from request URL
    const { partNumber } = req.params;
    // Query product record matching exact part number
    const product = await getProductByPartNumber(partNumber);
    // Return 404 status if product part number is invalid
    if (!product) return res.status(404).json({ error: "Product with this part number was not found." });
    // Return matched product object
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Controller to retrieve a single product by UUID
export const getProduct = async (req: Request<ProductIdParam>, res: Response): Promise<Response> => {
  try {
    // Extract product ID from URL params
    const { id } = req.params;
    // Fetch product record by ID
    const product = await getProductById(id);
    // Return 404 status if product ID is not found
    if (!product) return res.status(404).json({ error: "Product not found." });
    // Return product record with status 200
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Controller to register a new product in system catalog
export const addProduct = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Extract required product catalog properties from body
    const { part_number, brand_id, model_name, category } = req.body;
    // Call model to insert new product row
    const newProduct = await createProduct(part_number, brand_id, model_name, category);
    // Respond with 201 status and created product object
    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Controller to update an existing product record
export const editProduct = async (req: Request<ProductIdParam>, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { part_number, brand_id, model_name, category } = req.body;

    const updatedProduct = await UpdateProduct(id, {
      part_number,
      brand_id,
      model_name,
      category
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found or no updates performed." });
    }

    return res.status(200).json({
      message: "Product updated successfully.",
      data: updatedProduct
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Controller to remove product from catalog
export const removeProduct = async (req: Request<ProductIdParam>, res: Response): Promise<Response> => {
  try {
    // Extract product ID from params
    const { id } = req.params;
    // Execute product removal model function
    const deletedProduct = await deleteProduct(id);
    // Send 404 error if product ID was invalid
    if (!deletedProduct) return res.status(404).json({ error: "Product not found." });
    // Return success response to user
    return res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : String(error)
    });
  }
};