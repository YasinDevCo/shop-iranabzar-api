import { Category, ICategory } from "../models/Category";


export class CategoryService {
  static async create(data: Partial<ICategory>) {
    return Category.create(data);
  }

  static async getAll() {
    return Category.find().sort({ createdAt: -1 });
  }

  static async update(id: string, data: Partial<ICategory>) {
    return Category.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    return Category.findByIdAndDelete(id);
  }
}
