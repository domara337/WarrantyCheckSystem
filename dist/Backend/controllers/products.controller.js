"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProduct = exports.editProduct = exports.addProduct = exports.getProduct = exports.getByPartNumber = exports.getProductBybrand = exports.getProductsByBrand = exports.getAllProducts = void 0;
// Import product model functions
const products_model_1 = require("../models/products.model");
// Controller to retrieve entire product master catalog
const getAllProducts = async (req, res) => {
    try {
        // Query database for all products
        const products = await (0, products_model_1.getProducts)();
        // Send array of products in HTTP response
        return res.status(200).json(products);
    }
    catch (error) {
        return res.status(500).json({
            successful: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getAllProducts = getAllProducts;
// CHANGE: Controller to retrieve products filtered by brand_id (for cascading dropdown)
const getProductsByBrand = async (req, res) => {
    try {
        const brandIdParam = req.params.brandId;
        if (typeof brandIdParam !== "string") {
            return res.status(400).json({ error: "Invalid brand ID." });
        }
        const brandId = parseInt(brandIdParam, 10);
        if (isNaN(brandId)) {
            return res.status(400).json({ error: "Invalid brand ID." });
        }
        const products = await (0, products_model_1.getProductsByBrandId)(brandId);
        return res.status(200).json(products);
    }
    catch (error) {
        return res.status(500).json({
            successful: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getProductsByBrand = getProductsByBrand;
const getProductBybrand = async (req, res) => {
    try {
        // 1. Extract query parameter (e.g. ?brand=hp or ?q=hp e877)
        const brandQuery = req.query.brand;
        if (brandQuery !== undefined && typeof brandQuery !== "string") {
            return res.status(400).json({ message: "Brand query must be a single string." });
        }
        const brand = typeof brandQuery === "string" ? brandQuery : undefined;
        // 2. Pass the search term to your database query function
        const products = await (0, products_model_1.getProductsWithBrandName)(brand);
        if (!products.length) {
            return res.status(404).json({ message: "No products found matching that brand or query." });
        }
        return res.status(200).json(products);
    }
    catch (error) {
        return res.status(500).json({
            successful: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getProductBybrand = getProductBybrand;
// Controller to find a product using part number / SKU
const getByPartNumber = async (req, res) => {
    try {
        // Extract partNumber param from request URL
        const { partNumber } = req.params;
        // Query product record matching exact part number
        const product = await (0, products_model_1.getProductByPartNumber)(partNumber);
        // Return 404 status if product part number is invalid
        if (!product)
            return res.status(404).json({ error: "Product with this part number was not found." });
        // Return matched product object
        return res.status(200).json(product);
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getByPartNumber = getByPartNumber;
// Controller to retrieve a single product by UUID
const getProduct = async (req, res) => {
    try {
        // Extract product ID from URL params
        const { id } = req.params;
        // Fetch product record by ID
        const product = await (0, products_model_1.getProductById)(id);
        // Return 404 status if product ID is not found
        if (!product)
            return res.status(404).json({ error: "Product not found." });
        // Return product record with status 200
        return res.status(200).json(product);
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getProduct = getProduct;
// Controller to register a new product in system catalog
const addProduct = async (req, res) => {
    try {
        // Extract required product catalog properties from body
        const { part_number, brand_id, model_name, category } = req.body;
        // Call model to insert new product row
        const newProduct = await (0, products_model_1.createProduct)(part_number, brand_id, model_name, category);
        // Respond with 201 status and created product object
        return res.status(201).json(newProduct);
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.addProduct = addProduct;
// Controller to update an existing product record
const editProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { part_number, brand_id, model_name, category } = req.body;
        const updatedProduct = await (0, products_model_1.UpdateProduct)(id, {
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
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.editProduct = editProduct;
// Controller to remove product from catalog
const removeProduct = async (req, res) => {
    try {
        // Extract product ID from params
        const { id } = req.params;
        // Execute product removal model function
        const deletedProduct = await (0, products_model_1.deleteProduct)(id);
        // Send 404 error if product ID was invalid
        if (!deletedProduct)
            return res.status(404).json({ error: "Product not found." });
        // Return success response to user
        return res.status(200).json({ message: "Product deleted successfully." });
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.removeProduct = removeProduct;
