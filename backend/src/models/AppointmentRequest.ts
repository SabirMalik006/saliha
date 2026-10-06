import { Schema, model, type InferSchemaType } from 'mongoose';
import { idTransform } from './plugins/idTransform';

export const PATIENT_TYPES = ['new', 'returning'] as const;

export const APPOINTMENT_STATUSES = [
  'new',
  'contacted',
  'confirmed',
  'completed',
  'cancelled',
] as const;

const appointmentSchema = new Schema(
  {
    patientName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: null, trim: true, lowercase: true },
    preferredDate: { type: String, required: true, trim: true },
    preferredTime: { type: String, required: true, trim: true },
    serviceId: { type: String, default: null },
    serviceName: { type: String, default: null },
    patientType: { type: String, enum: PATIENT_TYPES, required: true },
    note: { type: String, default: null, trim: true, maxlength: 800 },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: 'new' },
    confirmedDate: { type: String, default: null },
    confirmedTime: { type: String, default: null },
    internalNotes: { type: String, default: null, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

appointmentSchema.index({ status: 1, createdAt: -1 });
idTransform(appointmentSchema);

export type AppointmentRequestDoc = InferSchemaType<typeof appointmentSchema>;
export const AppointmentRequest = model('AppointmentRequest', appointmentSchema);
