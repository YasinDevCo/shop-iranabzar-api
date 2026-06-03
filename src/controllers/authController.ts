import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("📥 Register Request Body:", req.body); // دیباگ
    console.log("🌐 Origin:", req.headers.origin); // دیباگ

    const { name, email, password, lastName, mobile } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, {
        success: false,
        message: "Email already registered",
        statusCode: 400,
      });
    }

    const user = await User.create({ name, lastName, mobile, email, password });
    const token = generateToken(user._id.toString());

    // ✅ ست کردن کوکی با options درست
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // تو development false باشه
      sameSite: "lax", // برای CORS تو development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
      path: "/", // مهم!
    });

    console.log("🍪 Cookie set:", token ? "✅" : "❌"); // دیباگ
    console.log("📤 Response Headers:", res.getHeaders()); // دیباگ

    return sendResponse(res, {
      success: true,
      message: "User registered",
      data: {
        user: {
          id: user._id,
          name: user.name,
          lastName: user.lastName,
          mobile: user.mobile,
          email: user.email,
          role: user.role,
        },
        token,
      },
      statusCode: 201,
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    next(err);
  }
};
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return sendResponse(res, {
        success: false,
        message: "Invalid email or password",
        statusCode: 401,
      });

    const token = generateToken(user._id.toString());

    // ذخیره توکن در کوکی
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(res, {
      success: true,
      message: "Logged in",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return sendResponse(res, {
      success: true,
      message: "User profile",
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
};
