import { Request, Response, NextFunction } from "express";
import { AddressService } from "../services/address.service";
import { sendResponse } from "../utils/response";

export class AddressController {
  static async getMyAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const addresses = await AddressService.getMyAddresses(userId);

      return sendResponse(res, {
        success: true,
        message: "آدرس‌های شما با موفقیت دریافت شد",
        data: addresses,
      });
    } catch (err) {
      console.error("❌ Get Addresses Error:", err);
      next(err);
    }
  }

  static async getAddressById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const address = await AddressService.getById(id.toString(), userId);

      if (!address) {
        return sendResponse(res, {
          success: false,
          message: "آدرس مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "آدرس با موفقیت دریافت شد",
        data: address,
      });
    } catch (err) {
      console.error("❌ Get Address By ID Error:", err);
      next(err);
    }
  }

  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { fullName, province, city, address, postalCode, phone, isDefault } = req.body;

      if (!fullName || !province || !city || !address || !postalCode || !phone) {
        return sendResponse(res, {
          success: false,
          message: "تمام فیلدهای آدرس الزامی هستند",
          statusCode: 400,
        });
      }

      const newAddress = await AddressService.create(userId, {
        fullName,
        province,
        city,
        address,
        postalCode,
        phone,
        isDefault: isDefault || false,
      });

      return sendResponse(res, {
        success: true,
        message: "آدرس با موفقیت افزوده شد",
        data: newAddress,
        statusCode: 201,
      });
    } catch (err) {
      console.error("❌ Create Address Error:", err);
      next(err);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const { fullName, province, city, address, postalCode, phone, isDefault } = req.body;

      const updatedAddress = await AddressService.update(id.toString(), userId, {
        fullName,
        province,
        city,
        address,
        postalCode,
        phone,
        isDefault,
      });

      if (!updatedAddress) {
        return sendResponse(res, {
          success: false,
          message: "آدرس مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "آدرس با موفقیت ویرایش شد",
        data: updatedAddress,
      });
    } catch (err) {
      console.error("❌ Update Address Error:", err);
      next(err);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const deletedAddress = await AddressService.delete(id.toString(), userId);

      if (!deletedAddress) {
        return sendResponse(res, {
          success: false,
          message: "آدرس مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "آدرس با موفقیت حذف شد",
      });
    } catch (err) {
      console.error("❌ Delete Address Error:", err);
      next(err);
    }
  }

  static async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const address = await AddressService.setDefault(id.toString(), userId);

      if (!address) {
        return sendResponse(res, {
          success: false,
          message: "آدرس مورد نظر یافت نشد",
          statusCode: 404,
        });
      }

      return sendResponse(res, {
        success: true,
        message: "آدرس پیش‌فرض با موفقیت تنظیم شد",
        data: address,
      });
    } catch (err) {
      console.error("❌ Set Default Address Error:", err);
      next(err);
    }
  }
}