import { Wishlist } from "../models/Wishlist";

export class WishlistService {
  // دریافت لیست علاقه‌مندی‌های کاربر
  static async getByUserId(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const items = await Wishlist.find({ userId })
      .populate("productId", "title price images slug stock")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Wishlist.countDocuments({ userId });

    return { items, total, page, pages: Math.ceil(total / limit) };
  }

  // افزودن به علاقه‌مندی‌ها
  static async add(userId: string, productId: string) {
    const existing = await Wishlist.findOne({ userId, productId });
    if (existing) {
      return existing;
    }
    return Wishlist.create({ userId, productId });
  }

  // حذف از علاقه‌مندی‌ها
  static async remove(userId: string, productId: string) {
    return Wishlist.findOneAndDelete({ userId, productId });
  }

  // پاک کردن همه علاقه‌مندی‌های کاربر
  static async clearAll(userId: string) {
    return Wishlist.deleteMany({ userId });
  }

  // بررسی اینکه محصول در علاقه‌مندی‌ها هست یا نه
  static async isInWishlist(userId: string, productId: string) {
    const item = await Wishlist.findOne({ userId, productId });
    return !!item;
  }

  // تعداد علاقه‌مندی‌های کاربر
  static async count(userId: string) {
    return Wishlist.countDocuments({ userId });
  }
}

