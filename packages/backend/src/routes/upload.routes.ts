// Image upload route — admin only.
// Stores uploaded files in packages/backend/uploads/ and returns a /uploads/<file> URL.
import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import { AppError } from '../lib/errors';

const router = Router();

// __dirname is src/routes/ — uploads lives two levels up at the package root.
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const EXT_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

router.post(
  '/admin/upload/image',
  requireAuth,
  requireAdmin,
  uploadSingle,
  (req, res, next) => {
    try {
      if (!req.file) throw new AppError('No image file provided', 400);
      const ext = EXT_MAP[req.file.mimetype] ?? '.jpg';
      const filename = `${crypto.randomUUID()}${ext}`;
      const filepath = path.join(UPLOADS_DIR, filename);
      fs.writeFileSync(filepath, req.file.buffer);
      res.json({ data: { url: `/uploads/${filename}` } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
