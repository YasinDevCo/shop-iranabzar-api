// controllers/contact.controller.ts
import { Request, Response, NextFunction } from "express";
import { Contact } from "../models/Contact";
import { sendResponse } from "../utils/response";

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, firstName, lastName, mobile, email, description } = req.body;

    // ایجاد پیام جدید
    const contact = await Contact.create({
      title,
      firstName,
      lastName,
      mobile,
      email,
      description
    });

    // ✅ ریسپانس موفقیت‌آمیز
    return sendResponse(res, {
      success: true,
      message: "پیام شما با موفقیت ارسال شد",
      data: {
        id: contact._id,
        title: contact.title,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        mobile: contact.mobile,
        status: contact.status,
        createdAt: contact.createdAt
      },
      statusCode: 201
    });

  } catch (err) {
    next(err);
  }
};

export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Contact.countDocuments(query);

    // ✅ ریسپانس با pagination
    return sendResponse(res, {
      success: true,
      message: "لیست پیام‌ها با موفقیت دریافت شد",
      data: {
        contacts: contacts.map(c => ({
          id: c._id,
          title: c.title,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          mobile: c.mobile,
          description: c.description,
          status: c.status,
          createdAt: c.createdAt
        })),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (err) {
    next(err);
  }
};

export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      // ❌ ریسپانس خطا (یافت نشد)
      return sendResponse(res, {
        success: false,
        message: "پیام مورد نظر یافت نشد",
        statusCode: 404
      });
    }

    // ✅ ریسپانس موفقیت
    return sendResponse(res, {
      success: true,
      message: "پیام با موفقیت دریافت شد",
      data: {
        id: contact._id,
        title: contact.title,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        mobile: contact.mobile,
        description: contact.description,
        status: contact.status,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });

  } catch (err) {
    next(err);
  }
};

export const updateContactStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;
    
    // اعتبارسنجی status
    if (!["pending", "read", "replied"].includes(status)) {
      return sendResponse(res, {
        success: false,
        message: "وضعیت وارد شده معتبر نیست",
        statusCode: 400
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return sendResponse(res, {
        success: false,
        message: "پیام مورد نظر یافت نشد",
        statusCode: 404
      });
    }

    // ✅ ریسپانس موفقیت
    return sendResponse(res, {
      success: true,
      message: "وضعیت پیام با موفقیت به‌روزرسانی شد",
      data: {
        id: contact._id,
        status: contact.status,
        updatedAt: contact.updatedAt
      }
    });

  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return sendResponse(res, {
        success: false,
        message: "پیام مورد نظر یافت نشد",
        statusCode: 404
      });
    }

    // ✅ ریسپانس موفقیت (بدون data)
    return sendResponse(res, {
      success: true,
      message: "پیام با موفقیت حذف شد"
    });

  } catch (err) {
    next(err);
  }
};

// گزارش‌گیری (مثلاً برای داشبورد)
export const getContactStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const total = await Contact.countDocuments();
    const pending = await Contact.countDocuments({ status: "pending" });
    const read = await Contact.countDocuments({ status: "read" });
    const replied = await Contact.countDocuments({ status: "replied" });
    
    // آخرین ۵ پیام
    const latest = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title firstName lastName email status createdAt");

    return sendResponse(res, {
      success: true,
      message: "آمار پیام‌ها با موفقیت دریافت شد",
      data: {
        stats: {
          total,
          pending,
          read,
          replied
        },
        latest: latest.map(c => ({
          id: c._id,
          title: c.title,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          status: c.status,
          createdAt: c.createdAt
        }))
      }
    });

  } catch (err) {
    next(err);
  }
};