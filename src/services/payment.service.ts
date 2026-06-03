import { Payment, IPayment } from "../models/Payment";
import { randomBytes } from "crypto";
import mongoose from "mongoose";

export class PaymentService {
  static async create(data: Partial<IPayment>) {
    return Payment.create(data);
  }

  static async getById(id: string) {
    // اعتبارسنجی ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Payment.findById(id).populate("userId", "name email mobile").populate("orderId");
  }

  static async getByOrderId(orderId: string) {
    // اعتبارسنجی ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return null;
    }
    return Payment.findOne({ orderId: new mongoose.Types.ObjectId(orderId) });
  }

  static async getByUserId(userId: string, page = 1, limit = 10) {
    // اعتبارسنجی ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { payments: [], total: 0, page, pages: 0 };
    }
    
    const skip = (page - 1) * limit;
    const payments = await Payment.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate("orderId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    return { payments, total, page, pages: Math.ceil(total / limit) };
  }

  static async getAll(page = 1, limit = 10, status?: string, search?: string) {
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { transactionCode: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const payments = await Payment.find(query)
      .populate("userId", "name email mobile")
      .populate("orderId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);
    return { payments, total, page, pages: Math.ceil(total / limit) };
  }

  static async updateStatus(id: string, status: IPayment["status"]) {
    // اعتبارسنجی ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    const updateData: any = { status };
    if (status === "paid") updateData.paidAt = new Date();
    return Payment.findByIdAndUpdate(id, updateData, { new: true });
  }

  static async delete(id: string) {
    // اعتبارسنجی ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Payment.findByIdAndDelete(id);
  }

  static generateTransactionCode(): string {
    return `TRX-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;
  }
}