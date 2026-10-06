import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppointmentRequest, ContactInquiry, Service } from '../models';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { parseOrThrow } from '../utils/parse';
import {
  appointmentRequestSchema,
  contactInquirySchema,
} from '../validation/schemas';

export const formsRouter = Router();

/** Protects the public forms from spam without blocking genuine visitors. */
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please wait a moment and try again.' },
});

/** POST /contact — creates an inquiry for the admin dashboard. */
formsRouter.post(
  '/contact',
  submitLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;

    // Honeypot: bots fill hidden fields that real users never see.
    if (String(body.company ?? '').trim()) {
      throw ApiError.unprocessable('Your message could not be submitted.');
    }

    const payload = parseOrThrow(contactInquirySchema, body);

    const created = await ContactInquiry.create({
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email ?? null,
      subject: payload.subject,
      message: payload.message,
    });

    res.status(201).json({ id: created.id, received: true });
  }),
);

/** POST /appointments — records a request; nothing is auto-confirmed. */
formsRouter.post(
  '/appointments',
  submitLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;

    if (String(body.company ?? '').trim()) {
      throw ApiError.unprocessable('Your request could not be submitted.');
    }

    const payload = parseOrThrow(appointmentRequestSchema, body);

    let serviceId: string | null = null;
    let serviceName: string | null = payload.serviceId ? null : 'Other';

    if (payload.serviceId) {
      const service = await Service.findById(payload.serviceId).catch(() => null);
      if (service) {
        serviceId = service.id;
        serviceName = service.title;
      }
    }

    const created = await AppointmentRequest.create({
      patientName: payload.patientName,
      phone: payload.phone,
      email: payload.email ?? null,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      serviceId,
      serviceName,
      patientType: payload.patientType,
      note: payload.note ?? null,
    });

    res.status(201).json({ id: created.id, received: true, status: created.status });
  }),
);
