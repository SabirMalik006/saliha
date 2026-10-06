import { Router } from 'express';
import { AppointmentRequest } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { buildPage, escapeRegex, readPaging } from '../../utils/helpers';
import { parseOrThrow } from '../../utils/parse';
import { appointmentUpdateSchema } from '../../validation/schemas';

export const appointmentsRouter = Router();

/** GET /admin/appointments?page&limit&search&status */
appointmentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = readPaging(req.query, 25);
    const filter: Record<string, unknown> = {};

    const status = String(req.query.status ?? 'all');
    if (status && status !== 'all') filter.status = status;

    const search = String(req.query.search ?? '').trim();
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ patientName: pattern }, { phone: pattern }];
    }

    const [items, total] = await Promise.all([
      AppointmentRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AppointmentRequest.countDocuments(filter),
    ]);

    res.json(buildPage(items, total, page, limit));
  }),
);

/** GET /admin/appointments/:id */
appointmentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const appointment = await AppointmentRequest.findById(req.params.id);
    if (!appointment) throw ApiError.notFound('Appointment request not found.');
    res.json(appointment);
  }),
);

/** Shared handler for PUT and PATCH. */
async function updateAppointment(id: string, body: unknown) {
  const appointment = await AppointmentRequest.findById(id);
  if (!appointment) throw ApiError.notFound('Appointment request not found.');

  const payload = parseOrThrow(appointmentUpdateSchema, body);
  appointment.set(payload);
  await appointment.save();
  return appointment;
}

appointmentsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateAppointment(req.params.id, req.body));
  }),
);

appointmentsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await updateAppointment(req.params.id, req.body));
  }),
);
