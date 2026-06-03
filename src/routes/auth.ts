import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController";
import { protect } from "../middlewares/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
// تست کوکی
// router.get("/check-cookie", (req, res) => {
//   console.log("🍪 All Cookies:", req.cookies);
//   console.log("🍪 Signed Cookies:", req.signedCookies);
  
//   res.json({
//     success: true,
//     cookies: req.cookies,
//     hasToken: !!req.cookies?.token,
//     headers: req.headers
//   });
// });

export default router;
