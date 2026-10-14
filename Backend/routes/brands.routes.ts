import {Router} from "express";
import {getBrands, getBrand, addBrand, removeBrand, updatedBrand} from "../controllers/brands.controller";


//initialize router
const router=Router();

//Route to fetch all brands
router.get("/",getBrands);

//Route to fetch a specific brand by id
router.get("/:id",getBrand);

//Route to add a new brand
router.post("/",addBrand);

//Router to remove a brand by an id 
router.delete("/:id",removeBrand);

//Router to update a brand by an id
router.put("/:id",updatedBrand);

export default router;