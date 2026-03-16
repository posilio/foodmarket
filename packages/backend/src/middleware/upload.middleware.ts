// Multer middleware for image uploads.
// Uses memory storage — files are never written to disk by multer itself;
// the route handler decides where to persist them.
import multer from 'multer';
import { AppError } from '../lib/errors';

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPEG, PNG and WebP images are allowed', 415));
    }
  },
});

export const uploadSingle = upload.single('image');
