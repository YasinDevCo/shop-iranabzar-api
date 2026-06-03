import { Request, Response, NextFunction } from "express";
import { BlogService } from "../services/blog.service";
import { sendResponse } from "../utils/response";

export class BlogController {
  // دریافت مقالات منتشر شده (عمومی)
  static async getPublished(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, tag, search } = req.query;
      const result = await BlogService.getPublished(
        Number(page),
        Number(limit),
        tag as string,
        search as string
      );

      return sendResponse(res, {
        success: true,
        message: "مقالات با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get Published Blogs Error:", err);
      next(err);
    }
  }

  // دریافت مقاله بر اساس slug (عمومی)
  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const blog = await BlogService.getBySlug(slug.toString());

      if (!blog) {
        return sendResponse(res, {
          success: false,
          message: "مقاله مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "مقاله با موفقیت دریافت شد",
        data: blog,
      });
    } catch (err) {
      console.error("❌ Get Blog By Slug Error:", err);
      next(err);
    }
  }

  // دریافت همه مقالات (ادمین)
  static async getAllAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const result = await BlogService.getAllAdmin(
        Number(page),
        Number(limit),
        status as string,
        search as string
      );

      return sendResponse(res, {
        success: true,
        message: "مقالات با موفقیت دریافت شد",
        data: result,
      });
    } catch (err) {
      console.error("❌ Get All Admin Blogs Error:", err);
      next(err);
    }
  }

  // دریافت مقاله بر اساس ID (ادمین)
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await BlogService.getById(req.params.id.toString())

      if (!blog) {
        return sendResponse(res, {
          success: false,
          message: "مقاله مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "مقاله با موفقیت دریافت شد",
        data: blog,
      });
    } catch (err) {
      console.error("❌ Get Blog By ID Error:", err);
      next(err);
    }
  }

  // ایجاد مقاله
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, summary, content, image, author, tags, status } = req.body;

      if (!title || !summary || !content || !author) {
        return sendResponse(res, {
          success: false,
          message: "عنوان، خلاصه، محتوا و نویسنده الزامی است",
          statusCode: 400,
        });
      }

      const blog = await BlogService.create({
        title,
        summary,
        content,
        image,
        author,
        tags: tags?.split(",").map((t: string) => t.trim()) || [],
        status: status || "draft",
      });

      return sendResponse(res, {
        success: true,
        message: "مقاله با موفقیت ایجاد شد",
        data: blog,
        statusCode: 201,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return sendResponse(res, {
          success: false,
          message: "مقاله با این عنوان قبلاً وجود دارد",
          statusCode: 400,
        });
      }
      console.error("❌ Create Blog Error:", err);
      next(err);
    }
  }

  // ویرایش مقاله
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, summary, content, image, author, tags, status } = req.body;

      const updateData: any = {};
      if (title) updateData.title = title;
      if (summary) updateData.summary = summary;
      if (content) updateData.content = content;
      if (image !== undefined) updateData.image = image;
      if (author) updateData.author = author;
      if (tags) updateData.tags = tags.split(",").map((t: string) => t.trim());
      if (status) updateData.status = status;

      const blog = await BlogService.update(req.params.id.toString(), updateData);

      if (!blog) {
        return sendResponse(res, {
          success: false,
          message: "مقاله مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "مقاله با موفقیت ویرایش شد",
        data: blog,
      });
    } catch (err) {
      console.error("❌ Update Blog Error:", err);
      next(err);
    }
  }

  // حذف مقاله
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const blog = await BlogService.delete(req.params.id.toString());

      if (!blog) {
        return sendResponse(res, {
          success: false,
          message: "مقاله مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "مقاله با موفقیت حذف شد",
      });
    } catch (err) {
      console.error("❌ Delete Blog Error:", err);
      next(err);
    }
  }

  // تغییر وضعیت
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!["draft", "published"].includes(status)) {
        return sendResponse(res, {
          success: false,
          message: "وضعیت نامعتبر است",
          statusCode: 400,
        });
      }

      const blog = await BlogService.updateStatus(req.params.id.toString(), status);

      if (!blog) {
        return sendResponse(res, {
          success: false,
          message: "مقاله مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: `مقاله ${status === "published" ? "منتشر" : "به پیش‌نویس"} شد`,
        data: blog,
      });
    } catch (err) {
      console.error("❌ Update Blog Status Error:", err);
      next(err);
    }
  }

  // آمار مقالات
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await BlogService.getStats();

      return sendResponse(res, {
        success: true,
        message: "آمار مقالات با موفقیت دریافت شد",
        data: stats,
      });
    } catch (err) {
      console.error("❌ Get Blog Stats Error:", err);
      next(err);
    }
  }
}