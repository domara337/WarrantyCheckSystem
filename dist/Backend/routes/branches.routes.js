"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branches_controller_1 = require("../controllers/branches.controller");
//Initialize express router instance
const router = (0, express_1.Router)();
//Route to fetch all branches
router.get("/", branches_controller_1.fetchAllBranches);
//Route to fetch a single branch by id
router.get("/:id", branches_controller_1.fetchBranchById);
//route to create a new branch
router.post("/", branches_controller_1.createNewBranch);
//router to delete a branch
router.delete("/:id", branches_controller_1.removeBranch);
//router to update a branch
router.put("/:id", branches_controller_1.editBranch);
exports.default = router;
