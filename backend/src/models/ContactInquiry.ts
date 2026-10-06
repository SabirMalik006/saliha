import { Schema, model, type InferSchemaType } from 'mongoose';
import { idTransform } from './plugins/idTransform';

export const CONTACT_SUBJECTS = [
  'appointment',
  'service-question',
  'general-inquiry',
] as const;

export const INQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;

const contactInquirySchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: null, trim: true, lowercase: true },
    subject: { type: String, enum: CONTACT_SUBJECTS, required: true },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    status: { type: String, enum: INQUIRY_STATUSES, default: 'new' },
    internalNotes: { type: String, default: null, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

contactInquirySchema.index({ status: 1, createdAt: -1 });
idTransform(contactInquirySchema);

export type ContactInquiryDoc = InferSchemaType<typeof contactInquirySchema>;
export const ContactInquiry = model('ContactInquiry', contactInquirySchema);
