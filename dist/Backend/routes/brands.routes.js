"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const brands_controller_1 = require("../controllers/brands.controller");
//initialize router
const router = (0, express_1.Router)();
//Route to fetch all brands
router.get("/", brands_controller_1.getBrands);
//Route to fetch a specific brand by id
router.get("/:id", brands_controller_1.getBrand);
//Route to add a new brand
router.post("/", brands_controller_1.addBrand);
//Router to remove a brand by an id 
router.delete("/:id", brands_controller_1.removeBrand);
//Router to update a brand by an id
router.put("/:id", brands_controller_1.updatedBrand);
exports.default = router;
