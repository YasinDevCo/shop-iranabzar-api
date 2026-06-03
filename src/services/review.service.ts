import { Review } from "../models/Review";

export class ReviewService {
  static async getMyReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ userId })
      .populate("productId", "title images price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ userId });

    return { reviews, total, page, pages: Math.ceil(total / limit) };
  }

  static async getByProductId(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ productId });
    const average = await Review.aggregate([
      { $match: { productId: productId } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);

    return { reviews, total, page, pages: Math.ceil(total / limit), average: average[0]?.avg || 0 };
  }

  static async create(userId: string, data: any) {
    const existing = await Review.findOne({ userId, productId: data.productId });
    if (existing) {
      throw new Error("شما قبلاً برای این محصول نظر ثبت کرده‌اید");
    }
    return Review.create({ ...data, userId });
  }

  static async update(id: string, userId: string, data: any) {
    return Review.findOneAndUpdate({ _id: id, userId }, data, { new: true });
  }

  static async delete(id: string, userId: string) {
    return Review.findOneAndDelete({ _id: id, userId });
  }

  static async getStats(userId: string) {
    const total = await Review.countDocuments({ userId });
    const average = await Review.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]);
    return { total, average: average[0]?.avg || 0 };
  }
}