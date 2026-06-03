import { Router } from "express";
import { protect } from "../middlewares/auth";
import { BlogController } from "../controllers/blogController";

const router = Router();

// مسیرهای عمومی
router.get("/", BlogController.getPublished);
router.get("/:slug", BlogController.getBySlug);

// مسیرهای ادمین
router.get("/admin/all", protect
    // , admin
    , BlogController.getAllAdmin);
router.get("/admin/:id", protect
    // , admin
    , BlogController.getById);
router.get("/admin/stats", protect
    // , admin
    , BlogController.getStats);
router.post("/admin", protect
    // , admin
    , BlogController.create);
router.put("/admin/:id", protect
    // , admin
    , BlogController.update);
router.delete("/admin/:id", protect
    // , admin
    , BlogController.delete);
router.patch("/admin/:id/status", protect
    // , admin
    , BlogController.updateStatus);

export default router;