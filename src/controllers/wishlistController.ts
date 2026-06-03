import { Request, Response, NextFunction } from "express";
import { WishlistService } from "../services/wishlist.service";
import { sendResponse } from "../utils/response";

export class WishlistController {
  // دریافت لیست علاقه‌مندی‌های من
  static async getMyWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await WishlistService.getByUserId(userId, Number(page), Number(limit));

      return sendResponse(res, {
        success: true,
        message: "لیست علاقه‌مندی‌ها با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get Wishlist Error:", err);
      next(err);
    }
  }

  // افزودن به علاقه‌مندی‌ها
  static async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.params;

      const wishlistItem = await WishlistService.add(userId, productId.toString());

      return sendResponse(res, {
        success: true,
        message: "محصول به علاقه‌مندی‌ها اضافه شد",
        data: wishlistItem,
        statusCode: 201,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return sendResponse(res, {
          success: false,
          message: "این محصول قبلاً در علاقه‌مندی‌های شما وجود دارد",
          statusCode: 400,
        });
      }
      console.error("❌ Add to Wishlist Error:", err);
      next(err);
    }
  }

  // حذف از علاقه‌مندی‌ها
  static async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.params;

      const result = await WishlistService.remove(userId, productId.toString());

      if (!result) {
        return sendResponse(res, {
          success: false,
          message: "محصول در علاقه‌مندی‌های شما یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "محصول از علاقه‌مندی‌ها حذف شد",
      });
    } catch (err) {
      console.error("❌ Remove from Wishlist Error:", err);
      next(err);
    }
  }

  // پاک کردن همه علاقه‌مندی‌ها
  static async clearWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await WishlistService.clearAll(userId);

      return sendResponse(res, {
        success: true,
        message: "همه علاقه‌مندی‌ها با موفقیت حذف شدند",
      });
    } catch (err) {
      console.error("❌ Clear Wishlist Error:", err);
      next(err);
    }
  }

  // بررسی وضعیت محصول در علاقه‌مندی‌ها
  static async checkWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { productId } = req.params;

      const isInWishlist = await WishlistService.isInWishlist(userId, productId.toString());

      return sendResponse(res, {
        success: true,
        message: "وضعیت علاقه‌مندی بررسی شد",
        data: { isInWishlist },
      });
    } catch (err) {
      console.error("❌ Check Wishlist Error:", err);
      next(err);
    }
  }

  // تعداد علاقه‌مندی‌های من
  static async getWishlistCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const count = await WishlistService.count(userId);

      return sendResponse(res, {
        success: true,
        message: "تعداد علاقه‌مندی‌ها دریافت شد",
        data: { count },
      });
    } catch (err) {
      console.error("❌ Wishlist Count Error:", err);
      next(err);
    }
  }
}