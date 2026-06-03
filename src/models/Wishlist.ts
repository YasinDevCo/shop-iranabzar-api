import mongoose, { Document, Schema, Model } from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// جلوگیری از ذخیره تکراری
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>("Wishlist", wishlistSchema);