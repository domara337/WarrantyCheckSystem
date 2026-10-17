"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedBrand = exports.removeBrand = exports.addBrand = exports.getBrand = exports.getBrands = void 0;
const brands_model_1 = require("../models/brands.model");
//controller to get list of manufactures
const getBrands = async (req, res) => {
    try {
        const brands = await (0, brands_model_1.getAllBrands)();
        return res.status(200).json(brands);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getBrands = getBrands;
//controller to get a specific brand by id
const getBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await (0, brands_model_1.getBrandByid)(id);
        if (!brand)
            return res.status(404).json({ error: "Brand not found" });
        //success message
        return res.status(200).json(brand);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.getBrand = getBrand;
//controller to add a new brand into database
const addBrand = async (req, res) => {
    try {
        const { name } = req.body;
        //Save new brand into database
        const newBrand = await (0, brands_model_1.createBrand)(name);
        return res.status(201).json(newBrand);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.addBrand = addBrand;
//controller to delete a brand from database
const removeBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBrand = await (0, brands_model_1.deleteBrand)(id);
        if (!deletedBrand)
            return res.status(404).json({ error: "Brand not found" });
        return res.status(200).json({ message: "Brand deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.removeBrand = removeBrand;
//controller to update the brand
const updatedBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        //validate incoming payload
        if (!id || !name) {
            return res.status(400).json({
                success: false,
                message: "Brand ID and name are required"
            });
        }
        //perform the update brand
        const UptBrand = await (0, brands_model_1.updateBrand)(id, name);
        //handle resource not found
        if (!UptBrand) {
            return res.status(404).json({
                success: false,
                message: "Brand not Found",
            });
        }
        //success message
        return res.status(200).json({ message: "Update Completed Successfully" });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : String(error)
        });
    }
};
exports.updatedBrand = updatedBrand;
