import { IProduct, Product } from "../models/Product";


export class ProductService {
  static async create(data: Partial<IProduct>) {
    return Product.create(data);
  }

  static async getAll(page = 1, limit = 12, search?: string) {
    const query: any = {};
    if (search) query.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("category")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return { products, total, page, pages: Math.ceil(total / limit) };
  }

  static async getById(id: string) {
    return Product.findById(id).populate("category");
  }

  static async getByCategory(categoryId: string) {
    return Product.find({ category: categoryId }).populate("category");
  }

  static async update(id: string, data: Partial<IProduct>) {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }

  static async delete(id: string) {
    return Product.findByIdAndDelete(id);
  }
}
