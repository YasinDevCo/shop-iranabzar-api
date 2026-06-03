import mongoose, { Document, Schema, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  total: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: "pending" | "paid" | "cancelled";
  shippingAddress: {
    fullName: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
    phone: string;
  };
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true }
});

const ShippingAddressSchema = new Schema({
  fullName: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },
  phone: { type: String, required: true }
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      default: []
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending"
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" }
  },
  { timestamps: true }
);

// pre hook برای ایجاد شماره سفارش
orderSchema.pre<IOrder>("save", async function () {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const OrderModel = this.constructor as Model<IOrder>;
    const count = await OrderModel.countDocuments();
    this.orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(4, "0")}`;
  }
});

export const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);