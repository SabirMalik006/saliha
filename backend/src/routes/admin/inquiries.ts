import { Router } from 'express';
import { ContactInquiry } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { buildPage, escapeRegex, readPaging } from '../../utils/helpers';
import { parseOrThrow } from '../../utils/parse';
import { inquiryUpdateSchema } from '../../validation/schemas';

export const inquiriesRouter = Router();

/** GET /admin/inquiries?page&limit&search&status */
inquiriesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = readPaging(req.query, 25);
    const filter: Record<string, unknown> = {};

    const status = String(req.query.status ?? 'all');
    if (status && status !== 'all') filter.status = status;

    const search = String(req.query.search ?? '').trim();
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ fullName: pattern }, { phone: pattern }];
    }

    const [items, total] = await Promise.all([
      ContactInquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactInquiry.countDocuments(filter),
    ]);

    res.json(buildPage(items, total, page, limit));
  }),
);

/** GET /admin/inquiries/:id */
inquiriesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) throw ApiError.notFound('Inquiry not found.');
    res.json(inquiry);
  }),
);

/** PUT|PATCH /admin/inquiries/:id — status and internal notes. */
inquiriesRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) throw ApiError.notFound('Inquiry not found.');

    const payload = parseOrThrow(inquiryUpdateSchema, req.body);
    if (payload.status !== undefined) inquiry.status = payload.status;
    if (payload.internalNotes !== undefined) inquiry.internalNotes = payload.internalNotes;
    await inquiry.save();

    res.json(inquiry);
  }),
);

inquiriesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) throw ApiError.notFound('Inquiry not found.');

    const payload = parseOrThrow(inquiryUpdateSchema, req.body);
    if (payload.status !== undefined) inquiry.status = payload.status;
    if (payload.internalNotes !== undefined) inquiry.internalNotes = payload.internalNotes;
    await inquiry.save();

    res.json(inquiry);
  }),
);
