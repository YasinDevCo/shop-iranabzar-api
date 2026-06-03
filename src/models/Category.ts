import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, lowercase: true }, // required رو بردار
  },
  { timestamps: true }
);

// روش صحیح - بدون next
categorySchema.pre<ICategory>('save', function() {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name.trim().toLowerCase().replace(/\s+/g, "-");
  }
});

export const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  categorySchema
);