import { Order, IOrder } from "../models/Order";
import mongoose from "mongoose";

export class OrderService {
  // دریافت سفارش بر اساس ID
  static async getById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Order.findById(id).populate("items.productId", "title images price");
  }

  // دریافت سفارشات یک کاربر با صفحه‌بندی
  static async getByUserId(userId: string, page = 1, limit = 10) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { orders: [], total: 0, page, pages: 0 };
    }
    const skip = (page - 1) * limit;
    const orders = await Order.find({ userId })
      .populate("items.productId", "title images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ userId });

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  // دریافت همه سفارشات (ادمین) با فیلتر
  static async getAll(page = 1, limit = 10, status?: string, search?: string) {
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate("userId", "name email mobile")
      .populate("items.productId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  // ایجاد سفارش جدید
  static async create(orderData: Partial<IOrder>) {
    return Order.create(orderData);
  }

  // به‌روزرسانی paymentId
  static async updatePaymentId(orderId: string, paymentId: any) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    return Order.findByIdAndUpdate(orderId, { paymentId }, { new: true });
  }

  // به‌روزرسانی وضعیت سفارش
  static async updateStatus(orderId: string, status: IOrder["status"]) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    return Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }

  // حذف سفارش (ادمین)
  static async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Order.findByIdAndDelete(id);
  }

  // آمار سفارشات (برای داشبورد ادمین)
  static async getStats() {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: "pending" });
    const paid = await Order.countDocuments({ status: "paid" });
    const cancelled = await Order.countDocuments({ status: "cancelled" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ createdAt: { $gte: today } });

    return { total, pending, paid, cancelled, todayOrders };
  }

  // آمار سفارشات کاربر جاری
  static async getUserStats(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { total: 0, pending: 0, paid: 0, cancelled: 0, totalAmount: 0 };
    }

    const total = await Order.countDocuments({ userId });
    const pending = await Order.countDocuments({ userId, status: "pending" });
    const paid = await Order.countDocuments({ userId, status: "paid" });
    const cancelled = await Order.countDocuments({ userId, status: "cancelled" });

    const totalAmount = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]);

    return {
      total,
      pending,
      paid,
      cancelled,
      totalAmount: totalAmount[0]?.total || 0
    };
  }


}