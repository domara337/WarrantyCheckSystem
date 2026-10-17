"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("../controllers/products.controller"); // Adjust path to your controller file
const router = (0, express_1.Router)();
// 1. Specific/Query routes MUST come before parameterized /:id routes
// GET /api/products
router.get("/", products_controller_1.getAllProducts);
// GET /api/products/brand?brand=hp
router.get("/brand", products_controller_1.getProductBybrand);
// GET /api/products/part/:partNumber
router.get("/part/:partNumber", products_controller_1.getByPartNumber);
// CHANGE: GET /api/products/by-brand/:brandId — fetch products filtered by brand (cascading dropdown)
// Must come before /:id to avoid path conflicts
router.get("/by-brand/:brandId", products_controller_1.getProductsByBrand);
// 2. Generic dynamic ID parameter routes
// GET /api/products/:id
router.get("/:id", products_controller_1.getProduct);
// POST /api/products
router.post("/", products_controller_1.addProduct);
// PUT /api/products/:id
router.put("/:id", products_controller_1.editProduct);
// DELETE /api/products/:id
router.delete("/:id", products_controller_1.removeProduct);
exports.default = router;
