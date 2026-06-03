import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { sendResponse } from "../utils/response";

export class ReviewController {
  // دریافت نظرات من (کاربر جاری)
  static async getMyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await ReviewService.getMyReviews(userId, Number(page), Number(limit));

      return sendResponse(res, {
        success: true,
        message: "نظرات شما با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get My Reviews Error:", err);
      next(err);
    }
  }

  // دریافت آمار نظرات من
  static async getReviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const stats = await ReviewService.getStats(userId);

      return sendResponse(res, {
        success: true,
        message: "آمار نظرات شما با موفقیت دریافت شد",
        data: stats,
      });
    } catch (err) {
      console.error("❌ Get Review Stats Error:", err);
      next(err);
    }
  }

  // دریافت نظرات یک محصول (عمومی)
  static async getProductReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await ReviewService.getByProductId(productId.toString(), Number(page), Number(limit));

      return sendResponse(res, {
        success: true,
        message: "نظرات محصول با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get Product Reviews Error:", err);
      next(err);
    }
  }

  // ثبت نظر جدید
  static async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId, rating, title, comment } = req.body;

      // اعتبارسنجی
      if (!productId) {
        return sendResponse(res, {
          success: false,
          message: "شناسه محصول الزامی است",
          statusCode: 400,
        });
      }

      if (!rating || rating < 1 || rating > 5) {
        return sendResponse(res, {
          success: false,
          message: "امتیاز باید بین 1 تا 5 باشد",
          statusCode: 400,
        });
      }

      if (!title || title.length < 3) {
        return sendResponse(res, {
          success: false,
          message: "عنوان نظر باید حداقل 3 کاراکتر باشد",
          statusCode: 400,
        });
      }

      if (!comment || comment.length < 10) {
        return sendResponse(res, {
          success: false,
          message: "متن نظر باید حداقل 10 کاراکتر باشد",
          statusCode: 400,
        });
      }

      const review = await ReviewService.create(userId, {
        productId,
        rating,
        title,
        comment,
      });

      return sendResponse(res, {
        success: true,
        message: "نظر شما با موفقیت ثبت شد",
        data: review,
        statusCode: 201,
      });
    } catch (err: any) {
      if (err.message === "شما قبلاً برای این محصول نظر ثبت کرده‌اید") {
        return sendResponse(res, {
          success: false,
          message: err.message,
          statusCode: 400,
        });
      }
      console.error("❌ Create Review Error:", err);
      next(err);
    }
  }

  // ویرایش نظر
  static async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { rating, title, comment } = req.body;

      const updateData: any = {};
      if (rating) updateData.rating = rating;
      if (title) updateData.title = title;
      if (comment) updateData.comment = comment;

      const review = await ReviewService.update(id.toString(), userId, updateData);

      if (!review) {
        return sendResponse(res, {
          success: false,
          message: "نظر مورد نظر یافت نشد یا شما دسترسی ندارید",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "نظر شما با موفقیت ویرایش شد",
        data: review,
      });
    } catch (err) {
      console.error("❌ Update Review Error:", err);
      next(err);
    }
  }

  // حذف نظر
  static async deleteReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const review = await ReviewService.delete(id.toString(), userId);

      if (!review) {
        return sendResponse(res, {
          success: false,
          message: "نظر مورد نظر یافت نشد یا شما دسترسی ندارید",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "نظر شما با موفقیت حذف شد",
      });
    } catch (err) {
      console.error("❌ Delete Review Error:", err);
      next(err);
    }
  }
}