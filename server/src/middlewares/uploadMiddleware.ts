import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { cloudinary } from '../config/cloudinary.js';
import { config } from '../config/env.js';
import { AppError } from './errorMiddleware.js';

const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMime = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP image formats are accepted.', 400));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 6, // Up to 6 product images
  },
  fileFilter,
});

export async function processUploadedFile(file: Express.Multer.File): Promise<{ url: string; publicId?: string }> {
  // If Cloudinary credentials are fully provided, upload to Cloudinary
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'localloop/products',
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      });
      // Clean up local temp file
      fs.unlink(file.path, () => {});
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      console.warn('[Upload] Cloudinary upload failed, falling back to local file path:', err);
    }
  }

  // Fallback: serve local static file from /uploads/
  return {
    url: `/uploads/${file.filename}`,
  };
}

