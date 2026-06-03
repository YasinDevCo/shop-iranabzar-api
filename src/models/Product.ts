import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, minlength: 10 },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: [{ type: String }],
  },
  { timestamps: true }
);

 productSchema.pre<IProduct>('save', async function () {
      if (!this.isNew && !this.isModified('title')) {
        return; 
      }

      if (this.title) {
        this.slug = this.title.trim().toLowerCase().replace(/\s+/g, "-");
      }
    });

    export const Product: Model<IProduct> = mongoose.model<IProduct>(
      "Product",
      productSchema
    );  