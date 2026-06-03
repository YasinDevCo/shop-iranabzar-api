import { Blog, IBlog } from "../models/Blog";

export class BlogService {
  // دریافت مقالات منتشر شده (عمومی)
  static async getPublished(page = 1, limit = 10, tag?: string, search?: string) {
    const query: any = { status: "published" };
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    return { blogs, total, page, pages: Math.ceil(total / limit) };
  }

  // دریافت مقاله بر اساس slug (عمومی - افزایش بازدید)
  static async getBySlug(slug: string) {
    const blog = await Blog.findOne({ slug, status: "published" });
    if (blog) {
      blog.views += 1;
      await blog.save();
    }
    return blog;
  }

  // دریافت همه مقالات (ادمین)
  static async getAllAdmin(page = 1, limit = 10, status?: string, search?: string) {
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    return { blogs, total, page, pages: Math.ceil(total / limit) };
  }

  // دریافت مقاله بر اساس ID (ادمین)
  static async getById(id: string) {
    return Blog.findById(id);
  }

  // ایجاد مقاله جدید
  static async create(data: Partial<IBlog>) {
    return Blog.create(data);
  }

  // ویرایش مقاله
  static async update(id: string, data: Partial<IBlog>) {
    return Blog.findByIdAndUpdate(id, data, { new: true });
  }

  // حذف مقاله
  static async delete(id: string) {
    return Blog.findByIdAndDelete(id);
  }

  // تغییر وضعیت
  static async updateStatus(id: string, status: "draft" | "published") {
    return Blog.findByIdAndUpdate(id, { status }, { new: true });
  }

  // آمار مقالات
  static async getStats() {
    const total = await Blog.countDocuments();
    const published = await Blog.countDocuments({ status: "published" });
    const draft = await Blog.countDocuments({ status: "draft" });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);

    return {
      total,
      published,
      draft,
      totalViews: totalViews[0]?.total || 0
    };
  }
}