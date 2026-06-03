import { Request, Response, NextFunction } from "express";
import { User, IUser } from "../models/User";
import { sendResponse } from "../utils/response";


export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, lastName, mobile, email, password, role } = req.body;
  const currentUser = (req as any).user;

  try {
    if (!currentUser) {
      return sendResponse(res, {
        success: false,
        message: "User not authenticated. Please log in to add a user.",
        statusCode: 401,
      });
    }

    if (currentUser.role !== "admin") {
      return sendResponse(res, {
        success: false,
        message: "Only administrators can add new users.",
        statusCode: 403,
      });
    }

    if (!name || name.length < 3 || name.length > 50) {
      return sendResponse(res, { success: false, message: "Name must be between 3 and 50 characters.", statusCode: 400 });
    }
    if (!lastName || lastName.length < 3 || lastName.length > 50) {
      return sendResponse(res, { success: false, message: "Last name must be between 3 and 50 characters.", statusCode: 400 });
    }
    if (!mobile || !/^\+?[0-9\s-]{10,15}$/.test(mobile)) {
      return sendResponse(res, { success: false, message: "Invalid mobile number format.", statusCode: 400 });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return sendResponse(res, { success: false, message: "Invalid email format.", statusCode: 400 });
    }
    if (!password || password.length < 6) {
      return sendResponse(res, { success: false, message: "Password must be at least 6 characters long.", statusCode: 400 });
    }
    // اعتبارسنجی نقش (در صورت نیاز)
    if (!role || !['user', 'admin'].includes(role)) {
      return sendResponse(res, { success: false, message: "Invalid role. Allowed roles are 'user' and 'admin'.", statusCode: 400 });
    }

    // بررسی تکراری نبودن ایمیل
    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      return sendResponse(res, {
        success: false,
        message: `Email '${email}' is already in use by another user.`,
        statusCode: 400,
      });
    }

    const newUser = new User({
      name,
      lastName,
      mobile,
      email,
      password,
      role,
    });

    const savedUser = await newUser.save();


    return sendResponse(res, {
      success: true,
      message: "User added successfully.",
      data: {
        user: {
          id: savedUser._id,
          name: savedUser.name,
          lastName: savedUser.lastName,
          mobile: savedUser.mobile,
          email: savedUser.email,
          role: savedUser.role,
        },
      },
      statusCode: 201,
    });

  } catch (err) {
    console.error("❌ Add User Error:", err);
    // اطمینان از اینکه پاسخ ارسال نشده است قبل از ارسال پاسخ خطا
    if (!res.headersSent) {
      sendResponse(res, { success: false, message: "An internal server error occurred while adding the user.", statusCode: 500 });
    }
    next(err); // پاس دادن خطا به middleware بعدی (مثلا error handler)
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.params.id;
  const { name, lastName, mobile, email, password } = req.body;
  const currentUser = (req as any).user;

  try {
    if (!currentUser) {
      return sendResponse(res, {
        success: false,
        message: "User not authenticated. Please log in.",
        statusCode: 401,
      });
    }

    if (currentUser.role !== "admin" && currentUser.id !== userId) {
      return sendResponse(res, {
        success: false,
        message: "Not authorized to update other users' profiles.",
        statusCode: 403,
      });
    }

    const user: IUser | null = await User.findById(userId);
    if (!user) {
      return sendResponse(res, {
        success: false,
        message: `User with ID ${userId} not found.`,
        statusCode: 404,
      });
    }

    if (name && (name.length < 3 || name.length > 50)) {
      return sendResponse(res, { success: false, message: "Name must be between 3 and 50 characters.", statusCode: 400 });
    }
    if (lastName && (lastName.length < 3 || lastName.length > 50)) {
      return sendResponse(res, { success: false, message: "Last name must be between 3 and 50 characters.", statusCode: 400 });
    }
    if (mobile && !/^\+?[0-9\s-]{10,15}$/.test(mobile)) {
      return sendResponse(res, { success: false, message: "Invalid mobile number format.", statusCode: 400 });
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return sendResponse(res, { success: false, message: "Invalid email format.", statusCode: 400 });
    }
    if (password && password.length < 6) {
      return sendResponse(res, { success: false, message: "Password must be at least 6 characters long.", statusCode: 400 });
    }

    let needsTokenRefresh = false;

    if (name) user.name = name;
    if (lastName) user.lastName = lastName;
    if (mobile) user.mobile = mobile;

    if (email) {
      if (currentUser.role === "admin") {
        const existingUserWithEmail = await User.findOne({ email });
        if (existingUserWithEmail && existingUserWithEmail._id.toString() !== userId) {
          return sendResponse(res, {
            success: false,
            message: `Email '${email}' is already in use by another user.`,
            statusCode: 400,
          });
        }
        user.email = email;
        needsTokenRefresh = true;
      } else if (user.email !== email) {
        return sendResponse(res, {
          success: false,
          message: "Email can only be updated by an administrator or after verification.",
          statusCode: 403,
        });
      }
    }

    if (password) {
      user.password = password;
      needsTokenRefresh = true;
    }

    const updatedUser = await user.save();

    let token: string | null = null;
    if (needsTokenRefresh) {
      console.warn("Token refresh needed due to user update, but generateToken function is not available in this context.");
    }

    return sendResponse(res, {
      success: true,
      message: "User profile updated successfully.",
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          lastName: updatedUser.lastName,
          mobile: updatedUser.mobile,
          email: updatedUser.email,
          role: updatedUser.role,
        },
        token: token,
      },
    });
  } catch (err) {
    console.error("❌ Update User Error:", err);
    if (!res.headersSent) {
      sendResponse(res, { success: false, message: "An internal server error occurred.", statusCode: 500 });
    }
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.params.id;
  const currentUser = (req as any).user;

  try {
    if (!currentUser) {
      return sendResponse(res, { success: false, message: "User not authenticated.", statusCode: 401 });
    }

    if (currentUser.role !== "admin") {
      return sendResponse(res, {
        success: false,
        message: "Not authorized. Only administrators can delete users.",
        statusCode: 403,
      });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return sendResponse(res, {
        success: false,
        message: `User with ID ${userId} not found.`,
        statusCode: 404,
      });
    }

    if (userToDelete._id.toString() === currentUser.id) {
      return sendResponse(res, {
        success: false,
        message: "You cannot delete your own administrator account.",
        statusCode: 400,
      });
    }

    await User.findByIdAndDelete(userId);

    return sendResponse(res, {
      success: true,
      message: `User with ID ${userId} deleted successfully.`,
      data: null,
    });
  } catch (err) {
    console.error("❌ Delete User Error:", err);
    if (!res.headersSent) {
      sendResponse(res, { success: false, message: "An internal server error occurred.", statusCode: 500 });
    }
    next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser = (req as any).user;
  const { page = 1, limit = 10, role, search } = req.query;

  try {
    if (!currentUser) {
      return sendResponse(res, { success: false, message: "User not authenticated.", statusCode: 401 });
    }

    if (currentUser.role !== "admin") {
      return sendResponse(res, {
        success: false,
        message: "Not authorized. Only administrators can view all users.",
        statusCode: 403,
      });
    }

    const query: any = {};
    if (role && typeof role === 'string') {
      query.role = role;
    }
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / (limit as any));

    const users: IUser[] = await User.find(query)
      .select('-password')
      .skip(((page as any) - 1) * (limit as any))
      .limit(limit as any)
      .sort({ createdAt: -1 });

    return sendResponse(res, {
      success: true,
      message: "Users fetched successfully.",
      data: {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: totalPages,
          totalUsers: totalUsers,
          limit: Number(limit),
        },
      },
    });
  } catch (err) {
    console.error("❌ Get All Users Error:", err);
    if (!res.headersSent) {
      sendResponse(res, { success: false, message: "An internal server error occurred.", statusCode: 500 });
    }
    next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.params.id;
  const currentUser = (req as any).user;

  try {
    if (!currentUser) {
      return sendResponse(res, {
        success: false,
        message: "User not authenticated.",
        statusCode: 401,
      });
    }

    // فقط ادمین یا خود کاربر بتواند اطلاعات را ببیند
    if (currentUser.role !== "admin" && currentUser.id !== userId) {
      return sendResponse(res, {
        success: false,
        message: "Not authorized to view this user.",
        statusCode: 403,
      });
    }

    const user = await User.findById(userId)
    // .select("-password");
    if (!user) {
      return sendResponse(res, {
        success: false,
        message: `User with ID ${userId} not found.`,
        statusCode: 404,
      });
    }

    return sendResponse(res, {
      success: true,
      message: "User fetched successfully.",
      data: { user },
      statusCode: 200,
    });

  } catch (err) {
    console.error("❌ Get User Error:", err);

    if (!res.headersSent) {
      sendResponse(res, {
        success: false,
        message: "An internal server error occurred.",
        statusCode: 500,
      });
    }

    next(err);
  }
};
