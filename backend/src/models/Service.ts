import { Schema, model, type InferSchemaType } from 'mongoose';
import { idTransform } from './plugins/idTransform';

export const SERVICE_ICONS = [
  'pregnancy',
  'menstrual',
  'fertility',
  'family-planning',
  'delivery',
  'menopause',
  'surgery',
  'general',
  'checkup',
] as const;

const serviceSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    shortDescription: { type: String, default: '', trim: true, maxlength: 500 },
    fullDescription: { type: String, default: '', trim: true, maxlength: 5000 },
    icon: { type: String, enum: SERVICE_ICONS, default: 'general' },
    imageUrl: { type: String, default: null },
    imageAlt: { type: String, default: null, trim: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    seoTitle: { type: String, default: null, trim: true },
    metaDescription: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

serviceSchema.index({ published: 1, displayOrder: 1 });
idTransform(serviceSchema);

export type ServiceDoc = InferSchemaType<typeof serviceSchema>;
export const Service = model('Service', serviceSchema);
