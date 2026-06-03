import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    summary: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: { type: String, required: true },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.pre<IBlog>("save", async function() {
  if (this.title && !this.slug) {
    this.slug = this.title.trim().toLowerCase().replace(/\s+/g, "-");
  }
});

blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ slug: 1 });

export const Blog: Model<IBlog> = mongoose.model<IBlog>("Blog", blogSchema);