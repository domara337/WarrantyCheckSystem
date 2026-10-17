"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("../controllers/customers.controller");
//Initialize router instance
const router = (0, express_1.Router)();
//Route to fetch all customers
router.get("/", customers_controller_1.getCustomers);
//Route to fetch a customer by their mobile number
router.get("/mobile/:mobile", customers_controller_1.getByMobile);
//Route to fetch a customer by their ID
router.get("/:id", customers_controller_1.getCustomer);
//Route to create a new customer
router.post("/", customers_controller_1.addCustomer);
//route to update a customer by their ID
router.put("/:id", customers_controller_1.UpdatedCustomer);
//Route to delete a customer by their ID
router.delete("/:id", customers_controller_1.removeCustomer);
exports.default = router;
