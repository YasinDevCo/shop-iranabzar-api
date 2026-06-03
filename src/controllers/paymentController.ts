import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { OrderService } from "../services/order.service";
import { sendResponse } from "../utils/response";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

export class PaymentController {
  // ایجاد درخواست پرداخت
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      const userId = (req as any).user.id;

      // اعتبارسنجی orderId
      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return sendResponse(res, {
          success: false,
          message: "شناسه سفارش معتبر نیست",
          statusCode: 400,
        });
      }

      const order = await OrderService.getById(orderId);
      if (!order) {
        return sendResponse(res, {
          success: false,
          message: "سفارش مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      if (order.userId.toString() !== userId.toString()) {
        return sendResponse(res, {
          success: false,
          message: "شما دسترسی به این سفارش ندارید",
          statusCode: 403,
        });
      }

      const existingPayment = await PaymentService.getByOrderId(orderId);
      if (existingPayment && existingPayment.status === "paid") {
        return sendResponse(res, {
          success: false,
          message: "این سفارش قبلاً پرداخت شده است",
          statusCode: 400,
        });
      }

      const transactionCode = uuidv4();

      const payment = await PaymentService.create({
        orderId: new mongoose.Types.ObjectId(orderId),
        userId: new mongoose.Types.ObjectId(userId),
        amount: order.total,
        transactionCode,
        status: "pending",
        description: `پرداخت سفارش شماره ${order.orderNumber}`,
      });

      await OrderService.updatePaymentId(orderId, payment._id);

      return sendResponse(res, {
        success: true,
        message: "درخواست پرداخت ایجاد شد",
        data: {
          payment,
          paymentUrl: `/api/payment/verify/${payment._id}`,
        },
        statusCode: 201,
      });
    } catch (err) {
      console.error("❌ Payment Create Error:", err);
      next(err);
    }
  }

  // تایید پرداخت
  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // اعتبارسنجی id
      if (!mongoose.Types.ObjectId.isValid(id.toString())) {
        return sendResponse(res, {
          success: false,
          message: "شناسه پرداخت معتبر نیست",
          statusCode: 400,
        });
      }

      const payment = await PaymentService.getById(id.toString());
      if (!payment) {
        return sendResponse(res, {
          success: false,
          message: "پرداخت مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      if (payment.status === "paid") {
        return sendResponse(res, {
          success: false,
          message: "این پرداخت قبلاً تایید شده است",
          statusCode: 400,
        });
      }

      // به‌روزرسانی وضعیت پرداخت
      await PaymentService.updateStatus(payment._id.toString(), "paid");
      
      // به‌روزرسانی وضعیت سفارش
      if (payment.orderId) {
        await OrderService.updateStatus(payment.orderId.toString(), "paid");
      }

      return sendResponse(res, {
        success: true,
        message: "پرداخت با موفقیت انجام شد",
        data: {
          transactionCode: payment.transactionCode,
          amount: payment.amount,
          paidAt: new Date(),
        },
      });
    } catch (err) {
      console.error("❌ Payment Verify Error:", err);
      next(err);
    }
  }

  // لغو پرداخت
  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id.toString())) {
        return sendResponse(res, {
          success: false,
          message: "شناسه پرداخت معتبر نیست",
          statusCode: 400,
        });
      }

      const payment = await PaymentService.getById(id.toString());
      if (!payment) {
        return sendResponse(res, {
          success: false,
          message: "پرداخت مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      if (payment.status !== "pending") {
        return sendResponse(res, {
          success: false,
          message: "فقط پرداخت‌های در انتظار قابل لغو هستند",
          statusCode: 400,
        });
      }

      await PaymentService.updateStatus(payment._id.toString(), "failed");

      return sendResponse(res, {
        success: true,
        message: "پرداخت با موفقیت لغو شد",
      });
    } catch (err) {
      console.error("❌ Payment Cancel Error:", err);
      next(err);
    }
  }

  // دریافت پرداخت‌های من
  static async getMyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await PaymentService.getByUserId(userId, page, limit);

      return sendResponse(res, {
        success: true,
        message: "پرداخت‌های شما با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get My Payments Error:", err);
      next(err);
    }
  }

  // دریافت همه پرداخت‌ها (ادمین)
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await PaymentService.getAll(page, limit, status, search);

      return sendResponse(res, {
        success: true,
        message: "پرداخت‌ها با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get All Payments Error:", err);
      next(err);
    }
  }

  // دریافت جزئیات یک پرداخت
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getById(req.params.id.toString());

      if (!payment) {
        return sendResponse(res, {
          success: false,
          message: "پرداخت مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "پرداخت با موفقیت دریافت شد",
        data: payment,
      });
    } catch (err) {
      console.error("❌ Get Payment By ID Error:", err);
      next(err);
    }
  }

  // حذف پرداخت (ادمین)
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getById(req.params.id.toString());

      if (!payment) {
        return sendResponse(res, {
          success: false,
          message: "پرداخت مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      await PaymentService.delete(req.params.id.toString());

      return sendResponse(res, {
        success: true,
        message: "پرداخت با موفقیت حذف شد",
      });
    } catch (err) {
      console.error("❌ Delete Payment Error:", err);
      next(err);
    }
  }
}