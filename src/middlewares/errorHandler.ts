import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("❌ Error:", err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendResponse(res, {
      success: false,
      message: `${field} already exists`,
      statusCode: 400,
    });
  }

  // Validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return sendResponse(res, {
      success: false,
      message: messages.join(", "),
      statusCode: 400,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return sendResponse(res, {
      success: false,
      message: "Invalid token",
      statusCode: 401,
    });
  }

  if (err.name === "TokenExpiredError") {
    return sendResponse(res, {
      success: false,
      message: "Token expired",
      statusCode: 401,
    });
  }

  // Default error
  sendResponse(res, {
    success: false,
    message: err.message || "Internal server error",
    statusCode: err.statusCode || 500,
  });
};

export default errorHandler;