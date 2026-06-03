import { NextFunction, Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { sendResponse } from "../utils/response";
import { Product } from "../models/Product";

export class ProductController {
  static async create(req: Request, res: Response) {
    const product = await ProductService.create(req.body);

    return sendResponse(res, {
      success: true,
      message: "Product created successfully",
      data: product,
    });
  }

  static async getAll(req: Request, res: Response) {
    const { page = 1, limit = 12, search } = req.query;

    const result = await ProductService.getAll(
      Number(page),
      Number(limit),
      search?.toString()
    );

    return sendResponse(res, {
      success: true,
      message: "Products fetched",
      data: result,
    });
  }

  static async getById(req: Request, res: Response) {
    
    const product = await ProductService.getById(req.params.id.toString());

    return sendResponse(res, {
      success: true,
      message: "Product fetched",
      data: product,
    });
  }

  static async getByCategory(req: Request, res: Response) {
    const products = await ProductService.getByCategory(req.params.categoryId.toString());

    return sendResponse(res, {
      success: true,
      message: "Products fetched by category",
      data: products,
    });
  }

  static async update(req: Request, res: Response) {
    const product = await ProductService.update(req.params.id.toString(), req.body);

    return sendResponse(res, {
      success: true,
      message: "Product updated",
      data: product,
    });
  }

  static async delete(req: Request, res: Response) {
    await ProductService.delete(req.params.id.toString());

    return sendResponse(res, {
      success: true,
      message: "Product deleted",
    });
  }

  static async filter(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        categories,
        minPrice,
        maxPrice,
        inStock,
        sort = "newest"
      } = req.query;

      const query: any = {};

      // جستجو در عنوان و توضیحات
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ];
      }

      // فیلتر بر اساس دسته‌بندی
      if (categories) {
        const categoryIds = (categories as string).split(",");
        query.category = { $in: categoryIds };
      }

      // فیلتر محدوده قیمت
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // فیلتر موجودی
      if (inStock === "true") {
        query.stock = { $gt: 0 };
      }

      // مرتب‌سازی
      let sortOption: any = { createdAt: -1 };
      switch (sort) {
        case "newest":
          sortOption = { createdAt: -1 };
          break;
        case "price_asc":
          sortOption = { price: 1 };
          break;
        case "price_desc":
          sortOption = { price: -1 };
          break;
        case "popular":
          sortOption = { views: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const products = await Product.find(query)
        .populate("category")
        .skip(skip)
        .limit(Number(limit))
        .sort(sortOption);

      const total = await Product.countDocuments(query);

      return sendResponse(res, {
        success: true,
        message: "Products filtered successfully",
        data: {
          products,
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (err) {
      console.error("❌ Filter Products Error:", err);
      next(err);
    }
  }
}
