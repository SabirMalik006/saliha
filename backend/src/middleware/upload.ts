import multer from 'multer';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
]);

/**
 * Keeps the uploaded file in memory so it can be streamed straight to
 * Cloudinary — nothing is written to the server's disk.
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadMb * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!ACCEPTED_MIME_TYPES.has(file.mimetype)) {
      callback(
        ApiError.unprocessable('Upload a JPG, PNG, WebP or AVIF image.', {
          image: 'Upload a JPG, PNG, WebP or AVIF image.',
        }),
      );
      return;
    }
    callback(null, true);
  },
}).single('image');
