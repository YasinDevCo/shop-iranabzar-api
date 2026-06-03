import { Router } from "express";
import { protect } from "../middlewares/auth";
import { WishlistController } from "../controllers/wishlistController";

const router = Router();

// مسیرهای کاربر عادی
router.get("/", protect, WishlistController.getMyWishlist);
router.get("/count", protect, WishlistController.getWishlistCount);
router.get("/check/:productId", protect, WishlistController.checkWishlist);
router.post("/add/:productId", protect, WishlistController.addToWishlist);
router.delete("/remove/:productId", protect, WishlistController.removeFromWishlist);
router.delete("/clear", protect, WishlistController.clearWishlist);

export default router;