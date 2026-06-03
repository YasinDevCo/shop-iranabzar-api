import { Response } from "express";

interface ResponseOptions {
  success: boolean;
  message: string;
  data?: any;
  statusCode?: number;
}

export const sendResponse = (
  res: Response,
  { success, message, data, statusCode = 200 }: ResponseOptions,
) => {
  return res.status(statusCode).json({
    success,
    message,
    ...(data && { data }),
    timestamp: new Date().toISOString(),
  });
};
