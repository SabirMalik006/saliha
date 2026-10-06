import { Router } from 'express';
import { destroyImage, uploadImageBuffer } from '../../config/cloudinary';
import { env, isCloudinaryConfigured } from '../../config/env';
import { GalleryItem } from '../../models';
import { uploadImage } from '../../middleware/upload';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { buildPage, escapeRegex, readPaging } from '../../utils/helpers';
import { parseOrThrow } from '../../utils/parse';
import { galleryCreateSchema, galleryUpdateSchema } from '../../validation/schemas';

export const galleryRouter = Router();

function assertStorageReady(): void {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      'Image storage is not configured yet. Add your Cloudinary keys to backend/.env.',
    );
  }
}

/** GET /admin/gallery?page&limit&search&status&category */
galleryRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = readPaging(req.query, 25);
    const filter: Record<string, unknown> = {};

    const status = String(req.query.status ?? 'all');
    if (status === 'published') filter.published = true;
    else if (status === 'draft') filter.published = false;

    const category = String(req.query.category ?? '').trim();
    if (category && category !== 'all') filter.category = category;

    const search = String(req.query.search ?? '').trim();
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: pattern }, { altText: pattern }];
    }

    const [items, total] = await Promise.all([
      GalleryItem.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      GalleryItem.countDocuments(filter),
    ]);

    res.json(buildPage(items, total, page, limit));
  }),
);

/** POST /admin/gallery — multipart upload (field name: `image`). */
galleryRouter.post(
  '/',
  uploadImage,
  asyncHandler(async (req, res) => {
    const payload = parseOrThrow(galleryCreateSchema, req.body);

    if (!req.file && !payload.imageUrl) {
      throw ApiError.unprocessable('Select an image to upload.', {
        imageUrl: 'Choose an image file.',
      });
    }

    let imageUrl = payload.imageUrl ?? '';
    let thumbnailUrl: string | null = null;
    let imagePublicId: string | null = null;

    if (req.file) {
      assertStorageReady();
      const uploaded = await uploadImageBuffer(req.file.buffer, {
        folder: `${env.cloudinary.folder}/gallery`,
      });
      imageUrl = uploaded.url;
      thumbnailUrl = uploaded.thumbnailUrl;
      imagePublicId = uploaded.publicId;
    }

    const created = await GalleryItem.create({
      title: payload.title,
      caption: payload.caption ?? null,
      altText: payload.altText,
      category: payload.category,
      imageUrl,
      thumbnailUrl,
      imagePublicId,
      displayOrder: payload.displayOrder,
      published: payload.published,
    });

    res.status(201).json(created);
  }),
);

/** GET /admin/gallery/:id */
galleryRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) throw ApiError.notFound('Gallery item not found.');
    res.json(item);
  }),
);

/** PATCH /admin/gallery/:id — accepts multipart (with a new file) or JSON. */
galleryRouter.patch(
  '/:id',
  uploadImage,
  asyncHandler(async (req, res) => {
    const existing = await GalleryItem.findById(req.params.id).select('+imagePublicId');
    if (!existing) throw ApiError.notFound('Gallery item not found.');

    const payload = parseOrThrow(galleryUpdateSchema, req.body);

    if (req.file) {
      assertStorageReady();
      const uploaded = await uploadImageBuffer(req.file.buffer, {
        folder: `${env.cloudinary.folder}/gallery`,
      });
      const previousPublicId = existing.imagePublicId;
      existing.imageUrl = uploaded.url;
      existing.thumbnailUrl = uploaded.thumbnailUrl;
      existing.imagePublicId = uploaded.publicId;
      void destroyImage(previousPublicId);
    } else if (payload.imageUrl) {
      existing.imageUrl = payload.imageUrl;
    }

    const { imageUrl: _imageUrl, ...rest } = payload;
    existing.set(rest);
    await existing.save();

    res.json(existing);
  }),
);

/** DELETE /admin/gallery/:id — removes the document and the Cloudinary asset. */
galleryRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await GalleryItem.findByIdAndDelete(req.params.id).select('+imagePublicId');
    if (!item) throw ApiError.notFound('Gallery item not found.');

    await destroyImage(item.imagePublicId);
    res.json({ success: true });
  }),
);
