import { Request, Response } from 'express';
import upload from '../middlewares/uploadArvan';
export const uploadImage = (req: Request, res: Response) => {
    upload.single('image')(req, res, (err: any) => {
        // خطای multer
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'خطا در آپلود فایل'
            });
        }

        // چک کردن وجود فایل
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'فایلی آپلود نشده است'
            });
        }

        // گرفتن آدرس فایل آپلود شده
        const fileUrl = (req.file as any).location;

        console.log('File uploaded successfully:', fileUrl);

        // ✅ پاسخ یکسان با بقیه APIها
        res.status(200).json({
            success: true,
            data: {
                url: fileUrl
            },
            message: 'تصویر با موفقیت آپلود شد'
        });
    });
};