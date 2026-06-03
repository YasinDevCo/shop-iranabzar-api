import { Router } from "express";
import { protect } from "../middlewares/auth";
import { addUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/userController";

const router = Router();

router.post("/add",protect, addUser);
router.put("/update/:id",protect, updateUser);
router.delete("/delete/:id", protect, deleteUser);
router.get("/getAll", protect, getAllUsers);
router.get("/getOne/:id", protect, getUserById);


export default router;
