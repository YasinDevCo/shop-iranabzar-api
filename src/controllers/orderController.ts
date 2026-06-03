import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { sendResponse } from "../utils/response";
import { Order } from "../models/Order";

export class OrderController {
  // دریافت سفارشات من (کاربر جاری)
  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await OrderService.getByUserId(userId, Number(page), Number(limit));

      return sendResponse(res, {
        success: true,
        message: "سفارشات شما با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get My Orders Error:", err);
      next(err);
    }
  }

  // دریافت جزئیات یک سفارش (کاربر جاری)
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const order = await OrderService.getById(id.toString());

      if (!order) {
        return sendResponse(res, {
          success: false,
          message: "سفارش مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      // بررسی دسترسی (فقط مالک یا ادمین)
      if (order.userId.toString() !== userId && (req as any).user.role !== "admin") {
        return sendResponse(res, {
          success: false,
          message: "شما دسترسی به این سفارش ندارید",
          statusCode: 403,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "جزئیات سفارش با موفقیت دریافت شد",
        data: order,
      });
    } catch (err) {
      console.error("❌ Get Order By ID Error:", err);
      next(err);
    }
  }

  // دریافت همه سفارشات (ادمین)
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;

      const result = await OrderService.getAll(Number(page), Number(limit), status as string, search as string);

      return sendResponse(res, {
        success: true,
        message: "سفارشات با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get All Orders Error:", err);
      next(err);
    }
  }

  // ایجاد سفارش جدید
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { items, subtotal, shippingCost, tax, discount, total, shippingAddress } = req.body;

      if (!items || items.length === 0) {
        return sendResponse(res, {
          success: false,
          message: "سبد خرید خالی است",
          statusCode: 400,
        });
      }

      if (!shippingAddress || !shippingAddress.fullName) {
        return sendResponse(res, {
          success: false,
          message: "آدرس حمل و نقل الزامی است",
          statusCode: 400,
        });
      }

      // ساختن شماره سفارش به صورت دستی
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const count = await Order.countDocuments();
      const orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(4, "0")}`;

      const order = await Order.create({
        orderNumber,
        userId,
        items,
        subtotal,
        shippingCost: shippingCost || 0,
        tax: tax || 0,
        discount: discount || 0,
        total,
        shippingAddress,
        status: "pending",
      });

      return sendResponse(res, {
        success: true,
        message: "سفارش با موفقیت ایجاد شد",
        data: order,
        statusCode: 201,
      });
    } catch (err) {
      console.error("❌ Create Order Error:", err);
      next(err);
    }
  }

  // به‌روزرسانی وضعیت سفارش (ادمین)
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ["pending", "paid", "cancelled"];
      if (!validStatuses.includes(status)) {
        return sendResponse(res, {
          success: false,
          message: "وضعیت نامعتبر است",
          statusCode: 400,
        });
      }

      const order = await OrderService.updateStatus(id.toString(), status);

      if (!order) {
        return sendResponse(res, {
          success: false,
          message: "سفارش مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "وضعیت سفارش با موفقیت به‌روزرسانی شد",
        data: order,
      });
    } catch (err) {
      console.error("❌ Update Order Status Error:", err);
      next(err);
    }
  }

  // حذف سفارش (ادمین)
  static async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const order = await OrderService.delete(id.toString());

      if (!order) {
        return sendResponse(res, {
          success: false,
          message: "سفارش مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "سفارش با موفقیت حذف شد",
      });
    } catch (err) {
      console.error("❌ Delete Order Error:", err);
      next(err);
    }
  }

  // آمار سفارشات (برای داشبورد)
  static async getOrderStats(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = (req as any).user.role === "admin";

      let stats;
      if (isAdmin) {
        stats = await OrderService.getStats();
      } else {
        stats = await OrderService.getUserStats((req as any).user.id);
      }

      return sendResponse(res, {
        success: true,
        message: "آمار سفارشات با موفقیت دریافت شد",
        data: stats,
      });
    } catch (err) {
      console.error("❌ Get Order Stats Error:", err);
      next(err);
    }
  }
}