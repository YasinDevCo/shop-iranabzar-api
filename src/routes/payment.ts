import { Router } from "express";
import { protect } from "../middlewares/auth";
import { PaymentController } from "../controllers/paymentController";

const router = Router();

// مسیرهای عمومی
router.post("/create", protect, PaymentController.create);
router.get("/verify/:id", protect, PaymentController.verify);
router.get("/cancel/:id", protect, PaymentController.cancel);
router.get("/my-payments", protect, PaymentController.getMyPayments);
router.get("/:id", protect, PaymentController.getById);

// مسیرهای ادمین
router.get("/admin/all", protect,
    //  admin, 
     PaymentController.getAll);
router.delete("/admin/:id", protect,
    //  admin,
      PaymentController.delete);

export default router;