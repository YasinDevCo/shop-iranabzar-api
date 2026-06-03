import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Interface
export interface IUser extends Document {
  name: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  matchPassword(password: string): Promise<boolean>;
}

// Schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    lastName: { type: String, required: true, trim: true, minlength: 3 },
    mobile: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

// Pre-save hook (نسخه صحیح برای TS)
userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// متد بررسی پسورد
userSchema.methods.matchPassword = async function (
  password: string,
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Export مدل
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
