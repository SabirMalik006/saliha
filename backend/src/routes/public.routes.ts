import { Router } from 'express';
import { GalleryItem, Service } from '../models';
import { asyncHandler } from '../utils/asyncHandler';
import { escapeRegex } from '../utils/helpers';
import { getSettingsDoc, toPublicSettings } from '../utils/settings';
import { ApiError } from '../utils/ApiError';

export const publicRouter = Router();

/* ------------------------------------------------------------------ services */

/** GET /services?search= — published services only, in display order. */
publicRouter.get(
  '/services',
  asyncHandler(async (req, res) => {
    const search = String(req.query.search ?? '').trim();
    const filter: Record<string, unknown> = { published: true };

    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: pattern }, { shortDescription: pattern }];
    }

    const services = await Service.find(filter).sort({ displayOrder: 1, createdAt: 1 });
    res.json(services);
  }),
);

/** GET /services/featured?limit= */
publicRouter.get(
  '/services/featured',
  asyncHandler(async (req, res) => {
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 8));
    const services = await Service.find({ published: true, featured: true })
      .sort({ displayOrder: 1, createdAt: 1 })
      .limit(limit);
    res.json(services);
  }),
);

/** GET /services/:slug */
publicRouter.get(
  '/services/:slug',
  asyncHandler(async (req, res) => {
    const service = await Service.findOne({
      slug: req.params.slug.toLowerCase(),
      published: true,
    });
    if (!service) throw ApiError.notFound('This service is not available.');
    res.json(service);
  }),
);

/* ------------------------------------------------------------------- gallery */

/** GET /gallery?category=&limit= — published images only. */
publicRouter.get(
  '/gallery',
  asyncHandler(async (req, res) => {
    const filter: Record<string, unknown> = { published: true };

    const category = String(req.query.category ?? '').trim();
    if (category && category !== 'all') filter.category = category;

    let query = GalleryItem.find(filter).sort({ displayOrder: 1, createdAt: -1 });

    const limit = Number(req.query.limit);
    if (Number.isFinite(limit) && limit > 0) query = query.limit(Math.min(200, limit));

    res.json(await query);
  }),
);

/* ------------------------------------------------------------------ settings */

/** GET /settings/public — clinic details with private fields stripped. */
publicRouter.get(
  '/settings/public',
  asyncHandler(async (_req, res) => {
    const settings = await getSettingsDoc();
    const json = settings.toJSON() as Record<string, unknown>;
    res.json(toPublicSettings(json));
  }),
);
