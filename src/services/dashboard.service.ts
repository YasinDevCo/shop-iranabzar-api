import { Request, Response, NextFunction } from "express";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { Contact } from "../models/Contact";
import { sendResponse } from "../utils/response";

export class DashboardController {
  // آمار کامل داشبورد (ادمین)
  static async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      // آمار سفارشات
      const totalOrders = await Order.countDocuments();
      const paidOrders = await Order.countDocuments({ status: "paid" });
      const pendingOrders = await Order.countDocuments({ status: "pending" });
      const cancelledOrders = await Order.countDocuments({ status: "cancelled" });

      // آمار فروش
      const salesResult = await Order.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);
      const totalSales = salesResult[0]?.total || 0;

      // فروش ماه جاری
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const monthlySalesResult = await Order.aggregate([
        { $match: { status: "paid", createdAt: { $gte: currentMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);
      const monthlySales = monthlySalesResult[0]?.total || 0;

      // فروش ماه قبل
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      lastMonth.setDate(1);
      lastMonth.setHours(0, 0, 0, 0);
      
      const lastMonthEnd = new Date();
      lastMonthEnd.setDate(0);
      lastMonthEnd.setHours(23, 59, 59, 999);
      
      const lastMonthSalesResult = await Order.aggregate([
        { $match: { status: "paid", createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);
      const lastMonthSales = lastMonthSalesResult[0]?.total || 0;
      
      const salesGrowth = lastMonthSales === 0 
        ? 100 
        : ((monthlySales - lastMonthSales) / lastMonthSales) * 100;

      // آمار محصولات
      const totalProducts = await Product.countDocuments();
      const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
      const outOfStockProducts = await Product.countDocuments({ stock: 0 });

      // آمار کاربران
      const totalUsers = await User.countDocuments();
      const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: currentMonth } });
      const adminCount = await User.countDocuments({ role: "admin" });
      const userCount = await User.countDocuments({ role: "user" });

      // آمار پرداخت‌ها
      const totalPayments = await Payment.countDocuments();
      const successfulPayments = await Payment.countDocuments({ status: "paid" });
      const failedPayments = await Payment.countDocuments({ status: "failed" });
      const pendingPayments = await Payment.countDocuments({ status: "pending" });

      // آمار پیام‌ها
      const totalMessages = await Contact.countDocuments();
      const unreadMessages = await Contact.countDocuments({ status: "pending" });
      const readMessages = await Contact.countDocuments({ status: "read" });
      const repliedMessages = await Contact.countDocuments({ status: "replied" });

      // آخرین سفارشات
      const recentOrders = await Order.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

      // محصولات پرفروش
      const topProducts = await Order.aggregate([
        { $unwind: "$items" },
        { $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" }
      ]);

      return sendResponse(res, {
        success: true,
        message: "آمار داشبورد با موفقیت دریافت شد",
        data: {
          orders: {
            total: totalOrders,
            paid: paidOrders,
            pending: pendingOrders,
            cancelled: cancelledOrders
          },
          sales: {
            total: totalSales,
            monthly: monthlySales,
            growth: Number(salesGrowth.toFixed(1))
          },
          products: {
            total: totalProducts,
            lowStock: lowStockProducts,
            outOfStock: outOfStockProducts
          },
          users: {
            total: totalUsers,
            newThisMonth: newUsersThisMonth,
            admins: adminCount,
            customers: userCount
          },
          payments: {
            total: totalPayments,
            successful: successfulPayments,
            failed: failedPayments,
            pending: pendingPayments
          },
          messages: {
            total: totalMessages,
            unread: unreadMessages,
            read: readMessages,
            replied: repliedMessages
          },
          recentOrders: recentOrders.map((order: any) => ({
            id: order._id,
            orderNumber: order.orderNumber,
            customer: order.userId?.name || "نامشخص",
            amount: order.total,
            status: order.status,
            date: order.createdAt
          })),
          topProducts: topProducts.map((item: any) => ({
            id: item.product._id,
            title: item.product.title,
            sold: item.totalSold,
            revenue: item.totalRevenue,
            image: item.product.images?.[0] || null
          }))
        }
      });
    } catch (err) {
      console.error("❌ Get Admin Stats Error:", err);
      next(err);
    }
  }

  // آمار داشبورد کاربر عادی
  static async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      // آمار سفارشات کاربر
      const totalOrders = await Order.countDocuments({ userId });
      const paidOrders = await Order.countDocuments({ userId, status: "paid" });
      const pendingOrders = await Order.countDocuments({ userId, status: "pending" });
      const cancelledOrders = await Order.countDocuments({ userId, status: "cancelled" });

      // مجموع مبلغ پرداختی
      const totalSpentResult = await Order.aggregate([
        { $match: { userId: userId, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]);
      const totalSpent = totalSpentResult[0]?.total || 0;

      // آخرین سفارشات کاربر
      const recentOrders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

      // تعداد محصولات در علاقه‌مندی‌ها
      const wishlistCount = await (await import("../models/Wishlist")).Wishlist.countDocuments({ userId });

      // تعداد نظرات کاربر
      const reviewsCount = await (await import("../models/Review")).Review.countDocuments({ userId });

      // میانگین امتیاز نظرات کاربر
      const avgRatingResult = await (await import("../models/Review")).Review.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, avg: { $avg: "$rating" } } }
      ]);
      const avgRating = avgRatingResult[0]?.avg || 0;

      // تعداد آدرس‌های کاربر
      const addressesCount = await (await import("../models/Address")).Address.countDocuments({ userId });

      // تعداد پرداخت‌های موفق
      const successfulPayments = await Payment.countDocuments({ userId, status: "paid" });

      return sendResponse(res, {
        success: true,
        message: "آمار کاربر با موفقیت دریافت شد",
        data: {
          orders: {
            total: totalOrders,
            paid: paidOrders,
            pending: pendingOrders,
            cancelled: cancelledOrders
          },
          totalSpent: totalSpent,
          wishlistCount: wishlistCount,
          reviewsCount: reviewsCount,
          avgRating: Number(avgRating.toFixed(1)),
          addressesCount: addressesCount,
          successfulPayments: successfulPayments,
          recentOrders: recentOrders.map((order: any) => ({
            id: order._id,
            orderNumber: order.orderNumber,
            amount: order.total,
            status: order.status,
            date: order.createdAt,
            itemsCount: order.items?.length || 0
          }))
        }
      });
    } catch (err) {
      console.error("❌ Get User Stats Error:", err);
      next(err);
    }
  }

  // آمار ساده برای ویجت‌های کوچک (ادمین)
  static async getWidgetStats(req: Request, res: Response, next: NextFunction) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      const [
        totalSales,
        todaySales,
        weekSales,
        monthSales,
        totalOrders,
        todayOrders,
        totalUsers,
        newUsersThisWeek,
        totalProducts,
        lowStockProducts,
        unreadMessages
      ] = await Promise.all([
        Order.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
        Order.aggregate([{ $match: { status: "paid", createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
        Order.aggregate([{ $match: { status: "paid", createdAt: { $gte: weekAgo } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
        Order.aggregate([{ $match: { status: "paid", createdAt: { $gte: monthAgo } } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: weekAgo } }),
        Product.countDocuments(),
        Product.countDocuments({ stock: { $lt: 10 } }),
        Contact.countDocuments({ status: "pending" })
      ]);

      return sendResponse(res, {
        success: true,
        message: "آمار ویجت با موفقیت دریافت شد",
        data: {
          sales: {
            total: totalSales[0]?.total || 0,
            today: todaySales[0]?.total || 0,
            week: weekSales[0]?.total || 0,
            month: monthSales[0]?.total || 0
          },
          orders: {
            total: totalOrders,
            today: todayOrders
          },
          users: {
            total: totalUsers,
            newThisWeek: newUsersThisWeek
          },
          products: {
            total: totalProducts,
            lowStock: lowStockProducts
          },
          messages: {
            unread: unreadMessages
          }
        }
      });
    } catch (err) {
      console.error("❌ Get Widget Stats Error:", err);
      next(err);
    }
  }
}