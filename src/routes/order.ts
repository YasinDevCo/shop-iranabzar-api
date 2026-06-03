import { Router } from "express";
import { protect } from "../middlewares/auth";
import { OrderController } from "../controllers/orderController";

const router = Router();

// مسیرهای کاربر عادی
router.get("/my-orders", protect, OrderController.getMyOrders);
router.get("/my-stats", protect, OrderController.getOrderStats);
router.get("/:id", protect, OrderController.getOrderById);
router.post("/create", protect, OrderController.createOrder);

// مسیرهای ادمین
router.get("/admin/all", protect
    // , admin
    , OrderController.getAllOrders);
router.put("/admin/:id/status", protect, 
    // admin,
     OrderController.updateOrderStatus);
router.delete("/admin/:id", protect, 
    // admin,
     OrderController.deleteOrder);

export default router;