// routes/contact.routes.ts
import express from "express";
import {
    createContact,
    getContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
} from "./../controllers/contactUsController";
import { protect } from "../middlewares/auth";

const router = express.Router();

// روت‌های عمومی
router.post("/", createContact);

// روت‌های محافظت شده (ادمین)
router.get("/", protect, getContacts);
router.get("/stats", protect, getContactStats); // آمار برای داشبورد
router.get("/:id", protect, getContactById);
router.patch("/:id/status", protect, updateContactStatus);
router.delete("/:id", protect, deleteContact);

export default router;