import mongoose, { Document, Model, Schema } from "mongoose";

// Interface
export interface IContact extends Document {
  title: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  description: string;
  status: "pending" | "read" | "replied";
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const contactSchema = new Schema<IContact>(
  {
    title: { 
      type: String, 
      required: [true, "عنوان الزامی است"], 
      trim: true,
      minlength: [3, "عنوان باید حداقل ۳ کاراکتر باشد"],
      maxlength: [100, "عنوان باید حداکثر ۱۰۰ کاراکتر باشد"]
    },
    
    firstName: { 
      type: String, 
      required: [true, "نام الزامی است"], 
      trim: true,
      minlength: [2, "نام باید حداقل ۲ کاراکتر باشد"]
    },
    
    lastName: { 
      type: String, 
      required: [true, "نام خانوادگی الزامی است"], 
      trim: true,
      minlength: [2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"]
    },
    
    mobile: { 
      type: String, 
      required: [true, "شماره موبایل الزامی است"],
      trim: true,
      match: [/^09[0-9]{9}$/, "شماره موبایل معتبر نیست"]
    },
    
    email: { 
      type: String, 
      required: [true, "ایمیل الزامی است"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "ایمیل معتبر نیست"]
    },
    
    description: { 
      type: String, 
      required: [true, "متن پیام الزامی است"],
      trim: true,
      minlength: [10, "پیام باید حداقل ۱۰ کاراکتر باشد"],
      maxlength: [1000, "پیام باید حداکثر ۱۰۰۰ کاراکتر باشد"]
    },
    
    status: { 
      type: String, 
      enum: ["pending", "read", "replied"], 
      default: "pending"
    },
  },
  { timestamps: true } // خودکار createdAt و updatedAt رو ایجاد میکنه
);

// ایندکس برای جستجوی سریع‌تر
contactSchema.index({ email: 1 });
contactSchema.index({ mobile: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

// Export مدل
export const Contact: Model<IContact> = mongoose.model<IContact>("Contact", contactSchema);