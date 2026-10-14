import {Router} from "express";

import {fetchAllBranches,fetchBranchById,createNewBranch,removeBranch,editBranch} from "../controllers/branches.controller"


//Initialize express router instance
const router=Router();


//Route to fetch all branches
router.get("/",fetchAllBranches)

//Route to fetch a single branch by id
router.get("/:id",fetchBranchById)

//route to create a new branch
router.post("/",createNewBranch)

//router to delete a branch
router.delete("/:id",removeBranch)

//router to update a branch
router.put("/:id",editBranch)

export default router;