import {Router} from "express";
import {login,register,RetrieveUsers,getUser,removeUser} from "../controllers/user.controller";


//Initialize router instance
const router=Router();

//Public route for user login
router.post("/login",login);

//Public route for user registration
router.post("/register",register);

//Protected route to retrieve all internal staff accounts
router.get("/",RetrieveUsers);

//Protected route to fetch a single user by their ID
router.get("/:id",getUser);

//Protected route to remove a staff user account by their ID
router.delete("/:id",removeUser);

export default router;
