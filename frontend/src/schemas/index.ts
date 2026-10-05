import { z } from 'zod';
import {
  cleanMultiline,
  cleanText,
  EMAIL_ERROR_MESSAGE,
  isValidEmail,
  isValidPakistaniPhone,
  PHONE_ERROR_MESSAGE,
} from '@/utils/validation';
import { APPOINTMENT_NOTE_MAX, CLINIC_TIME_SLOTS } from '@/constants/clinic';
import { todayLocalISO } from '@/utils/format';

const nameField = z
  .string()
  .transform((value) => cleanText(value))
  .pipe(
    z
      .string()
      .min(2, { message: 'This field is required.' })
      .max(80, { message: 'Please keep this under 80 characters.' }),
  );

const phoneField = z
  .string()
  .transform((value) => cleanText(value))
  .pipe(
    z.string().refine(isValidPakistaniPhone, { message: PHONE_ERROR_MESSAGE }),
  );

const optionalEmail = z
  .union([z.string(), z.undefined()])
  .transform((value) => cleanText(value ?? ''))
  .refine((value) => value === '' || isValidEmail(value), {
    message: EMAIL_ERROR_MESSAGE,
  });

/** Honeypot: hidden from humans, must remain empty. */
const honeypot = z.string().max(0).optional();

/* ==========================================================================
   Contact form
   ========================================================================== */

export const contactSubjectEnum = z.enum([
  'appointment',
  'service-question',
  'general-inquiry',
]);

export type ContactFormValues = z.infer<typeof contactSchema>;

export const contactSchema = z.object({
  fullName: nameField,
  phone: phoneField,
  email: optionalEmail,
  subject: contactSubjectEnum.default('general-inquiry'),
  message: z
    .string()
    .transform((value) => cleanMultiline(value))
    .pipe(
      z
        .string()
        .min(10, { message: 'Please provide at least 10 characters.' })
        .max(
          1500,
          { message: 'Please keep your message under 1,500 characters.' },
        ),
    ),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you agree to be contacted.' }),
  }),
  company: honeypot,
});

/* ==========================================================================
   Appointment request form
   ========================================================================== */

export const timeSlotValues = CLINIC_TIME_SLOTS.map((slot) => slot.value) as [
  string,
  ...string[],
];

export const appointmentSchema = z.object({
  patientName: nameField,
  phone: phoneField,
  email: optionalEmail,
  preferredDate: z
    .string()
    .min(1, { message: 'Please choose a preferred date.' })
    .refine((value) => !/^\d{4}-\d{2}-\d{2}$/.test(value) || value >= todayLocalISO(), {
      message: 'Please choose today or a future date.',
    }),
  preferredTime: z.enum(timeSlotValues as [string, ...string[]], {
    errorMap: () => ({ message: 'Please choose a preferred time slot.' }),
  }),
  serviceId: z.string().optional(),
  patientType: z.enum(['new', 'returning']),
  note: z
    .string()
    .optional()
    .transform((value) => cleanMultiline(value ?? ''))
    .refine((value) => value.length <= APPOINTMENT_NOTE_MAX, {
      message: `Please keep your note under ${APPOINTMENT_NOTE_MAX} characters.`,
    }),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you agree to be contacted.' }),
  }),
  company: honeypot,
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

/* ==========================================================================
   Auth
   ========================================================================== */

export const loginSchema = z.object({
  identifier: z
    .string()
    .transform((value) => cleanText(value))
    .pipe(
      z
        .string()
        .min(1, { message: 'Enter your email or username.' })
        .max(160, { message: 'This value is too long.' }),
    ),
  password: z
    .string()
    .min(1, { message: 'Enter your password.' })
    .max(200, { message: 'This value is too long.' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/* ==========================================================================
   Admin — service
   ========================================================================== */

export const serviceIconEnum = z.enum([
  'pregnancy',
  'menstrual',
  'fertility',
  'family-planning',
  'delivery',
  'menopause',
  'surgery',
  'general',
  'checkup',
]);

export const serviceSchema = z.object({
  title: z
    .string()
    .transform((value) => cleanText(value))
    .pipe(
      z
        .string()
        .min(3, { message: 'Enter a service title.' })
        .max(120, { message: 'Keep the title under 120 characters.' }),
    ),
  slug: z
    .string()
    .transform((value) => cleanText(value).toLowerCase())
    .pipe(
      z
        .string()
        .min(3, { message: 'Enter a URL slug.' })
        .max(120)
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'Use lowercase letters, numbers and single hyphens only.',
        ),
    ),
  shortDescription: z
    .string()
    .transform((value) => cleanText(value))
    .pipe(
      z
        .string()
        .min(10, { message: 'Add a short summary (at least 10 characters).' })
        .max(240, { message: 'Keep the summary under 240 characters.' }),
    ),
  fullDescription: z
    .string()
    .transform((value) => cleanMultiline(value))
    .pipe(
      z
        .string()
        .min(30, { message: 'Add a fuller description (at least 30 characters).' })
        .max(4000, { message: 'Keep the description under 4,000 characters.' }),
    ),
  icon: serviceIconEnum.default('general'),
  imageUrl: z.string().trim().url().nullable().or(z.literal('')).default(''),
  imageAlt: z.string().trim().max(200).nullable().or(z.literal('')).default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  displayOrder: z.coerce.number()
    .int('Use a whole number.')
    .min(0, 'Use 0 or a positive number.')
    .max(9999, 'Use a number below 9,999.'),
  seoTitle: z.string().trim().max(70).nullable().or(z.literal('')).default(''),
  metaDescription: z
    .string()
    .trim()
    .max(180, 'Keep the meta description under 180 characters.')
    .nullable()
    .or(z.literal(''))
    .default(''),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

/* ==========================================================================
   Admin — gallery
   ========================================================================== */

export const GALLERY_CATEGORY_ENUM = z.enum([
  'clinic',
  'awareness',
  'events',
  'promotional',
]);

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return 'Upload a JPG, PNG, WebP or AVIF image.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.';
  }
  return null;
}

export const gallerySchema = z.object({
  title: z
    .string()
    .transform((value) => cleanText(value))
    .pipe(
      z
        .string()
        .min(3, { message: 'Enter an image title.' })
        .max(140, { message: 'Keep the title under 140 characters.' }),
    ),
  caption: z
    .string()
    .transform((value) => cleanText(value))
    .pipe(z.string().max(300, { message: 'Keep the caption under 300 characters.' })),
  altText: z
    .string()
    .transform((value) => cleanText(value))
    .pipe(
      z
        .string()
        .min(8, { message: 'Describe the image for screen readers.' })
        .max(200, { message: 'Keep the alt text under 200 characters.' }),
    ),
  category: GALLERY_CATEGORY_ENUM.default('clinic'),
  imageUrl: z.string().trim().url('Enter a valid image URL.').or(z.literal('')).default(''),
  displayOrder: z.coerce.number()
    .int('Use a whole number.')
    .min(0, 'Use 0 or a positive number.')
    .max(9999, 'Use a number below 9,999.'),
  published: z.boolean().default(false),
});

export type GalleryFormValues = z.infer<typeof gallerySchema>;

/* ==========================================================================
   Admin — settings
   ========================================================================== */

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\/.+/i.test(value), {
    message: 'Enter a full URL starting with https://',
  });

const optionalPhoneDigits = z
  .string()
  .trim()
  .transform((value) => cleanText(value))
  .refine((value) => value === '' || isValidPakistaniPhone(value), {
    message: PHONE_ERROR_MESSAGE,
  });

export const settingsSchema = z.object({
  clinicName: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(2).max(80)),
  doctorName: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(2).max(80)),
  doctorDesignation: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(2).max(120)),
  doctorQualifications: z
    .array(z.string().trim().min(1).max(40))
    .min(1, 'List at least one qualification.')
    .max(10),
  carePhilosophy: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(3).max(160)),
  addressLine: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(5).max(200)),
  addressLandmark: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().max(160)),
  addressCity: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(2).max(80)),
  clinicHours: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().min(3).max(80)),
  phone: optionalPhoneDigits,
  phoneDisplay: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().max(40)),
  alternatePhone: optionalPhoneDigits,
  alternatePhoneDisplay: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().max(40)),
  whatsappNumber: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v === '' || (v.length >= 10 && v.length <= 15), {
      message: 'Enter the WhatsApp number with country code, e.g. 923310000643.',
    }),
  whatsappDisplay: z
    .string()
    .transform((v) => cleanText(v))
    .pipe(z.string().max(40)),
  notificationEmail: z.string().trim().refine((v) => v === '' || isValidEmail(v), {
    message: EMAIL_ERROR_MESSAGE,
  }),
  mapUrl: optionalUrl,
  social: z.object({
    facebook: optionalUrl,
    instagram: optionalUrl,
    linkedin: optionalUrl,
  }),
  siteUrl: optionalUrl,
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

/* ==========================================================================
   Admin — record updates
   ========================================================================== */

export const inquiryStatusEnum = z.enum(['new', 'contacted', 'closed']);

export const appointmentStatusEnum = z.enum([
  'new',
  'contacted',
  'confirmed',
  'completed',
  'cancelled',
]);

export const inquiryUpdateSchema = z.object({
  status: inquiryStatusEnum,
  internalNotes: z
    .string()
    .transform((v) => cleanMultiline(v))
    .pipe(z.string().max(2000, 'Keep notes under 2,000 characters.')),
});

export const appointmentUpdateSchema = z.object({
  status: appointmentStatusEnum,
  confirmedDate: z
    .string()
    .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Enter a valid date.')
    .optional(),
  confirmedTime: z
    .string()
    .refine(
      (v) => v === '' || timeSlotValues.includes(v),
      'Choose a slot between 6:00 PM and 9:00 PM.',
    )
    .optional(),
  internalNotes: z
    .string()
    .transform((v) => cleanMultiline(v))
    .pipe(z.string().max(2000, 'Keep notes under 2,000 characters.')),
});

export type InquiryUpdateValues = z.infer<typeof inquiryUpdateSchema>;
export type AppointmentUpdateValues = z.infer<typeof appointmentUpdateSchema>;