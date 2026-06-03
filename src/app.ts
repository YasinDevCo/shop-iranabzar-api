import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import notFound from "./middlewares/notFound";
import errorHandler from "./middlewares/errorHandler";
import authRoutes from "./routes/auth";
import contactRoutes from "./routes/contact";
import userRoutes from "./routes/user";
import userProduct from "./routes/product";
import userCategory from "./routes/category";
import cookieParser from "cookie-parser";
import paymentRoutes from "./routes/payment";
import orderRoutes from "./routes/order";
import wishlistRoutes from "./routes/wishlist";
import addressRoutes from "./routes/address";
import reviewRoutes from "./routes/review";
import dashboardRoutes from "./routes/dashboard";
import blogRoutes from "./routes/blog";
import uploadRoutes from "./routes/upload";

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
    exposedHeaders: ["set-cookie"],
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes)
app.use("/api/product", userProduct)
app.use("/api/category", userCategory)
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blogs", blogRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;