import { Router } from 'express';
import { uploadImageBuffer } from '../../config/cloudinary';
import { env, isCloudinaryConfigured } from '../../config/env';
import { uploadImage } from '../../middleware/upload';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';

export const uploadsRouter = Router();

/** Keeps the Cloudinary folder name safe for use in a path. */
function safeFolder(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return cleaned || fallback;
}

/**
 * POST /admin/uploads/image
 *
 * Uploads a single image (multipart field `image`) to Cloudinary and returns
 * its URLs. Used by admin forms that only need a URL back — unlike the gallery
 * endpoint, which also creates a database record.
 */
uploadsRouter.post(
  '/image',
  uploadImage,
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw ApiError.unprocessable('Choose an image file to upload.', {
        image: 'Choose an image file.',
      });
    }

    if (!isCloudinaryConfigured()) {
      throw new ApiError(
        503,
        'Image storage is not configured yet. Add your Cloudinary keys to backend/.env.',
      );
    }

    const folder = safeFolder(req.body?.folder, 'uploads');

    const uploaded = await uploadImageBuffer(req.file.buffer, {
      folder: `${env.cloudinary.folder}/${folder}`,
    });

    res.status(201).json({
      url: uploaded.url,
      thumbnailUrl: uploaded.thumbnailUrl,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
    });
  }),
);
