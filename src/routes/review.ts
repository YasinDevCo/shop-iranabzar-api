import { Router } from "express";
import { protect } from "../middlewares/auth";
import { ReviewController } from "../controllers/reviewController";

const router = Router();

router.get("/my-reviews", protect, ReviewController.getMyReviews);
router.get("/my-stats", protect, ReviewController.getReviewStats);
router.get("/product/:productId", ReviewController.getProductReviews);
router.post("/", protect, ReviewController.createReview);
router.put("/:id", protect, ReviewController.updateReview);
router.delete("/:id", protect, ReviewController.deleteReview);

export default router;