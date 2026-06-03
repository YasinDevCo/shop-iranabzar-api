import { Router } from "express";
import { protect } from "../middlewares/auth";
import { ProductController } from "../controllers/productController";
import { validate } from "../middlewares/validate";
import { createProductSchema, updateProductSchema } from "../validations/product.validation";

const router = Router();

router.get("/filter", ProductController.filter);
router.get("/category/:categoryId", ProductController.getByCategory);
router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);



router.post("/", validate(createProductSchema), protect, ProductController.create);
router.put("/:id", validate(updateProductSchema), protect, ProductController.update);
router.delete("/:id", protect, ProductController.delete);

export default router;
