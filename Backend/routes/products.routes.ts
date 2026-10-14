import { Router } from "express";
import {
  getAllProducts,
  getProductBybrand,
  getProductsByBrand, // CHANGE: added for cascading Brand → Product dropdown
  getByPartNumber,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
} from "../controllers/products.controller"; // Adjust path to your controller file

const router = Router();

// 1. Specific/Query routes MUST come before parameterized /:id routes
// GET /api/products
router.get("/", getAllProducts);

// GET /api/products/brand?brand=hp
router.get("/brand", getProductBybrand);

// GET /api/products/part/:partNumber
router.get("/part/:partNumber", getByPartNumber);

// CHANGE: GET /api/products/by-brand/:brandId — fetch products filtered by brand (cascading dropdown)
// Must come before /:id to avoid path conflicts
router.get("/by-brand/:brandId", getProductsByBrand);

// 2. Generic dynamic ID parameter routes
// GET /api/products/:id
router.get("/:id", getProduct);

// POST /api/products
router.post("/", addProduct);

// PUT /api/products/:id
router.put("/:id", editProduct);

// DELETE /api/products/:id
router.delete("/:id", removeProduct);

export default router;