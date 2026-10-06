import { Schema, model, type InferSchemaType } from 'mongoose';
import { idTransform } from './plugins/idTransform';

/**
 * One settings document per deployment (see `getSettings()`), matching the
 * frontend `ClinicSettings` type so the site renders identical content.
 */
const siteSettingsSchema = new Schema(
  {
    singleton: { type: String, default: 'site', unique: true, immutable: true },
    clinicName: { type: String, default: 'Specialist Clinic', trim: true },
    doctorName: { type: String, default: 'Dr. Saleha Ibtisam', trim: true },
    doctorDesignation: {
      type: String,
      default: 'Consultant Gynecologist & Obstetrician',
      trim: true,
    },
    doctorQualifications: { type: [String], default: ['MBBS', 'FCPS'] },
    carePhilosophy: {
      type: String,
      default: 'Safe Care • Expert Guidance • Better Tomorrow',
      trim: true,
    },
    addressLine: {
      type: String,
      default: 'Shop No. 5, Fazal Palaza, Kotha Kalan Rd, Kotha Kalan Morgah, Rawalpindi',
      trim: true,
    },
    addressLandmark: { type: String, default: 'Near Citilab Morgah', trim: true },
    addressCity: { type: String, default: 'Rawalpindi, Pakistan', trim: true },
    clinicHours: { type: String, default: '6:00 PM – 9:00 PM', trim: true },
    phone: { type: String, default: '0515431070', trim: true },
    phoneDisplay: { type: String, default: '051-5431070', trim: true },
    alternatePhone: { type: String, default: '03348676501', trim: true },
    alternatePhoneDisplay: { type: String, default: '0334-8676501', trim: true },
    whatsappNumber: { type: String, default: '923310000643', trim: true },
    whatsappDisplay: { type: String, default: '0331-0000643', trim: true },
    notificationEmail: { type: String, default: null, trim: true },
    mapUrl: { type: String, default: null, trim: true },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    siteUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

idTransform(siteSettingsSchema);

export type SiteSettingsDoc = InferSchemaType<typeof siteSettingsSchema>;
export const SiteSettings = model('SiteSettings', siteSettingsSchema);
