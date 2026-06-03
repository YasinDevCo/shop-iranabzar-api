import { Router } from "express";

import { CategoryController } from "../controllers/categoryController";
import { protect } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createCategorySchema, updateCategorySchema } from "../validations/category.validation";

const router = Router();

router.get("/", CategoryController.getAll);
router.post("/", validate(createCategorySchema), protect, CategoryController.create);
router.put("/:id",validate(updateCategorySchema), protect, CategoryController.update);
router.delete("/:id", protect, CategoryController.delete);

export default router;
