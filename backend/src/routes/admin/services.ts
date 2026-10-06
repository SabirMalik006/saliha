import { Router } from 'express';
import { Service } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { buildPage, escapeRegex, readPaging } from '../../utils/helpers';
import { parseOrThrow } from '../../utils/parse';
import { slugify } from '../../utils/validation';
import {
  reorderSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
} from '../../validation/schemas';

export const servicesRouter = Router();

async function assertSlugFree(slug: string, ignoreId?: string): Promise<void> {
  const existing = await Service.findOne({ slug }).select('_id');
  if (existing && existing.id !== ignoreId) {
    throw ApiError.conflict('A service with this slug already exists.', {
      slug: 'This URL slug is already in use.',
    });
  }
}

/** Shared body for PUT and PATCH: merges only the fields that were sent. */
async function updateService(id: string, body: unknown) {
  const existing = await Service.findById(id);
  if (!existing) throw ApiError.notFound('Service not found.');

  const payload = parseOrThrow(serviceUpdateSchema, body);

  if (payload.slug !== undefined) {
    const slug = payload.slug.toLowerCase();
    await assertSlugFree(slug, existing.id);
    existing.slug = slug;
  }

  const { slug: _slug, ...rest } = payload;
  existing.set(rest);
  await existing.save();
  return existing;
}

/** GET /admin/services?page&limit&search&status */
servicesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = readPaging(req.query, 25);
    const filter: Record<string, unknown> = {};

    const status = String(req.query.status ?? 'all');
    if (status === 'published') filter.published = true;
    else if (status === 'draft') filter.published = false;

    const search = String(req.query.search ?? '').trim();
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ title: pattern }, { slug: pattern }];
    }

    const [items, total] = await Promise.all([
      Service.find(filter).sort({ displayOrder: 1, createdAt: 1 }).skip(skip).limit(limit),
      Service.countDocuments(filter),
    ]);

    res.json(buildPage(items, total, page, limit));
  }),
);

/** POST /admin/services/reorder — declared before `/:id` so it is not shadowed. */
servicesRouter.post(
  '/reorder',
  asyncHandler(async (req, res) => {
    const { ids } = parseOrThrow(reorderSchema, req.body);

    await Promise.all(
      ids.map((id, index) => Service.findByIdAndUpdate(id, { displayOrder: index })),
    );

    const services = await Service.find({ _id: { $in: ids } }).sort({ displayOrder: 1 });
    res.json(services);
  }),
);

/** POST /admin/services */
servicesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = parseOrThrow(serviceCreateSchema, req.body);
    const slug = (payload.slug ?? slugify(payload.title)).toLowerCase();

    if (!slug) {
      throw ApiError.unprocessable('A URL slug is required.', {
        slug: 'Enter a slug or a title we can build one from.',
      });
    }

    await assertSlugFree(slug);

    const created = await Service.create({
      ...payload,
      slug,
      imageUrl: payload.imageUrl ?? null,
      imageAlt: payload.imageAlt ?? null,
      seoTitle: payload.seoTitle ?? null,
      metaDescription: payload.metaDescription ?? null,
    });

    res.status(201).json(created);
  }),
);

/** GET /admin/services/:id */
servicesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw ApiError.notFound('Service not found.');
    res.json(service);
  }),
);

/** PUT|PATCH /admin/services/:id */
servicesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateService(req.params.id, req.body));
  }),
);

servicesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateService(req.params.id, req.body));
  }),
);

/** DELETE /admin/services/:id */
servicesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) throw ApiError.notFound('Service not found.');
    res.json({ success: true });
  }),
);
