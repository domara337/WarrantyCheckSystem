import {Router} from "express";
import {login,register,RetrieveUsers,getUser,updateUserDetails,removeUser} from "../controllers/user.controller";
import { adminMiddleware, authMiddleware } from "../middleware/authMiddleware";


//Initialize router instance
const router=Router();

//Public route for user login
router.post("/login",login);

//Public route for user registration
router.post("/register",register);

// Only administrators can view or manage user accounts.
router.get("/",authMiddleware,adminMiddleware,RetrieveUsers);

router.get("/:id",authMiddleware,adminMiddleware,getUser);

router.put("/:id",authMiddleware,adminMiddleware,updateUserDetails);

router.delete("/:id",authMiddleware,adminMiddleware,removeUser);

export default router;
