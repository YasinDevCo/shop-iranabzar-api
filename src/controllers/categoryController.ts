import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { sendResponse } from "../utils/response";


export class CategoryController {
     static async getAll(req: Request, res: Response) {
        const categories = await CategoryService.getAll();
        return sendResponse(res, {
            success: true,
            message: "Categories fetched",
            data: categories,
        });
    }
    static async create(req: Request, res: Response) {
        const category = await CategoryService.create(req.body);
        return sendResponse(res, {
            success: true,
            message: "Category created successfully",
            data: category,
        });
    }
    static async update(req: Request, res: Response) {
        const category = await CategoryService.update(req.params.id.toString(), req.body);

        return sendResponse(res, {
            success: true,
            message: "Category updated",
            data: category,
        });
    }
    static async delete(req: Request, res: Response) {
        await CategoryService.delete(req.params.id.toString());

        return sendResponse(res, {
            success: true,
            message: "Category deleted",
        });
    }
}
