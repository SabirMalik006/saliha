import { z } from 'zod';
import {
  APPOINTMENT_STATUSES,
  CONTACT_SUBJECTS,
  GALLERY_CATEGORIES,
  INQUIRY_STATUSES,
  PATIENT_TYPES,
  SERVICE_ICONS,
} from '../models';
import { toBoolean } from '../utils/helpers';
import { isValidPakistaniPhone } from '../utils/validation';

const PHONE_ERROR = 'Please enter a valid phone or WhatsApp number.';

/** `''` -> `undefined` (field treated as absent). */
const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

/** `''` -> `null` (field treated as explicitly cleared). */
const emptyToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const phoneField = z
  .string({ required_error: PHONE_ERROR })
  .trim()
  .refine(isValidPakistaniPhone, { message: PHONE_ERROR });

const optionalEmailField = z.preprocess(
  emptyToUndefined,
  z.string().trim().email('Please enter a valid email address.').optional(),
);

const consentField = z.literal(true, {
  errorMap: () => ({ message: 'Consent is required.' }),
});

/** Booleans may arrive as JSON booleans or "true"/"false" multipart strings. */
const booleanField = (fallback: boolean) =>
  z.preprocess((value) => (value === undefined ? fallback : toBoolean(value)), z.boolean());

/* ------------------------------------------------------------- public forms */

export const contactInquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be between 2 and 80 characters.')
    .max(80, 'Full name must be between 2 and 80 characters.'),
  phone: phoneField,
  email: optionalEmailField,
  subject: z.enum(CONTACT_SUBJECTS, {
    errorMap: () => ({ message: 'Choose a valid subject.' }),
  }),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be between 10 and 1,500 characters.')
    .max(1500, 'Message must be between 10 and 1,500 characters.'),
  consent: consentField,
  company: z.string().optional(),
});

export const appointmentRequestSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, 'Patient name must be between 2 and 80 characters.')
    .max(80, 'Patient name must be between 2 and 80 characters.'),
  phone: phoneField,
  email: optionalEmailField,
  preferredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid preferred date.'),
  preferredTime: z.string().trim().min(1, 'Choose a preferred time slot.'),
  serviceId: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  patientType: z.enum(PATIENT_TYPES, {
    errorMap: () => ({ message: 'Choose whether this is a new or returning patient.' }),
  }),
  note: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(800, 'Note must be under 800 characters.').optional(),
  ),
  consent: consentField,
  company: z.string().optional(),
});

/* ----------------------------------------------------------------- services */

const serviceCreateObject = z.object({
  slug: z.preprocess(emptyToUndefined, z.string().trim().max(140).optional()),
  title: z
    .string()
    .trim()
    .min(1, 'Service title is required.')
    .max(120, 'Keep the title under 120 characters.'),
  shortDescription: z.string().trim().max(500).default(''),
  fullDescription: z.string().trim().max(5000).default(''),
  icon: z.enum(SERVICE_ICONS).default('general'),
  imageUrl: z.preprocess(
    emptyToNull,
    z.string().trim().url('Enter a valid image URL.').nullable().optional(),
  ),
  imageAlt: z.preprocess(
    emptyToNull,
    z.string().trim().max(200).nullable().optional(),
  ),
  featured: booleanField(false),
  published: booleanField(false),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  seoTitle: z.preprocess(
    emptyToNull,
    z.string().trim().max(70).nullable().optional(),
  ),
  metaDescription: z.preprocess(
    emptyToNull,
    z.string().trim().max(180).nullable().optional(),
  ),
});

export const serviceCreateSchema = serviceCreateObject;
export const serviceUpdateSchema = serviceCreateObject.partial();

export const reorderSchema = z.object({
  ids: z.array(z.string().trim().min(1)),
});

/* ------------------------------------------------------------------ gallery */

const galleryMetaObject = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Image title is required.')
    .max(140, 'Keep the title under 140 characters.'),
  caption: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(300, 'Keep the caption under 300 characters.').optional(),
  ),
  altText: z
    .string()
    .trim()
    .min(1, 'Describe the image for screen readers.')
    .max(200, 'Keep the alt text under 200 characters.'),
  category: z.enum(GALLERY_CATEGORIES).default('clinic'),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: booleanField(false),
  imageUrl: z.preprocess(emptyToUndefined, z.string().trim().url().optional()),
});

export const galleryCreateSchema = galleryMetaObject;
export const galleryUpdateSchema = galleryMetaObject.partial();

/* --------------------------------------------------------- record updates */

export const inquiryUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  internalNotes: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().trim().max(2000).nullable().optional(),
  ),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  confirmedDate: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().trim().nullable().optional(),
  ),
  confirmedTime: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().trim().nullable().optional(),
  ),
  internalNotes: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().trim().max(2000).nullable().optional(),
  ),
});

export const settingsUpdateSchema = z.object({
  clinicName: z.string().trim().min(1).max(120).optional(),
  doctorName: z.string().trim().min(1).max(120).optional(),
  doctorDesignation: z.string().trim().max(160).optional(),
  doctorQualifications: z.array(z.string().trim().min(1)).max(20).optional(),
  carePhilosophy: z.string().trim().max(240).optional(),
  addressLine: z.string().trim().max(240).optional(),
  addressLandmark: z.string().trim().max(160).optional(),
  addressCity: z.string().trim().max(120).optional(),
  clinicHours: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  phoneDisplay: z.string().trim().max(40).optional(),
  alternatePhone: z.string().trim().max(40).optional(),
  alternatePhoneDisplay: z.string().trim().max(40).optional(),
  whatsappNumber: z.string().trim().max(40).optional(),
  whatsappDisplay: z.string().trim().max(40).optional(),
  notificationEmail: z.preprocess(
    emptyToNull,
    z.string().trim().email().nullable().optional(),
  ),
  mapUrl: z.preprocess(emptyToNull, z.string().trim().nullable().optional()),
  social: z
    .object({
      facebook: z.string().trim().max(300).optional(),
      instagram: z.string().trim().max(300).optional(),
      linkedin: z.string().trim().max(300).optional(),
    })
    .optional(),
  siteUrl: z.string().trim().max(200).optional(),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or username.'),
  password: z.string().min(1, 'Enter your password.'),
});
