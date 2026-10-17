"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
//Initialize router instance
const router = (0, express_1.Router)();
//Public route for user login
router.post("/login", user_controller_1.login);
//Public route for user registration
router.post("/register", user_controller_1.register);
//Protected route to retrieve all internal staff accounts
router.get("/", user_controller_1.RetrieveUsers);
//Protected route to fetch a single user by their ID
router.get("/:id", user_controller_1.getUser);
//Protected route to remove a staff user account by their ID
router.delete("/:id", user_controller_1.removeUser);
exports.default = router;
