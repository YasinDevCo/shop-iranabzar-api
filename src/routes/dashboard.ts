import { Router } from "express";
import { protect } from "../middlewares/auth";
import { DashboardController } from "../services/dashboard.service";

const router = Router();

// آمار کامل ادمین
router.get("/admin/stats", protect,
    //  admin,
      DashboardController.getAdminStats);

// آمار کاربر عادی
router.get("/user/stats", protect, DashboardController.getUserStats);

// آمار ویجت (ساده)
router.get("/widgets", protect
    // , admin
    , DashboardController.getWidgetStats);

export default router;