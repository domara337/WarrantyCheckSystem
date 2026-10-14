import {Router} from "express";

import {getCustomers,getByMobile,getCustomer,addCustomer,removeCustomer,UpdatedCustomer}    from "../controllers/customers.controller";

//Initialize router instance
const router=Router();

//Route to fetch all customers
router.get("/",getCustomers);

//Route to fetch a customer by their mobile number
router.get("/mobile/:mobile",getByMobile);

//Route to fetch a customer by their ID
router.get("/:id",getCustomer);

//Route to create a new customer
router.post("/",addCustomer);

//route to update a customer by their ID
router.put("/:id",UpdatedCustomer);

//Route to delete a customer by their ID
router.delete("/:id",removeCustomer);

export default router;