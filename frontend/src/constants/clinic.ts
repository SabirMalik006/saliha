/**
 * Single source of truth for clinic contact details and business rules.
 *
 * These values are the documented, approved contact roles:
 *   051-5431070   clinic phone
 *   0331-0000643  WhatsApp
 *   0334-8676501  alternate contact
 *
 * They are mirrored in the editable `SiteSettings` admin screen so the clinic
 * can update them without a code deploy. `defaultClinicSettings` is used as
 * the fallback when the settings endpoint is unavailable.
 */

import type { ClinicSettings } from '@/types';

export const CLINIC_CONTACT = {
  phone: '0515431070',
  phoneDisplay: '051-5431070',
  alternatePhone: '03348676501',
  alternatePhoneDisplay: '0334-8676501',
  whatsappNumber: '923310000643',
  whatsappDisplay: '0331-0000643',
} as const;

export const CLINIC_HOURS_DISPLAY = '6:00 PM – 9:00 PM';

/**
 * Clinic location supplied and confirmed by the clinic owner.
 * Used to build map links and the embedded map, so no coordinate is guessed.
 */
export const CLINIC_LOCATION = {
  latitude: 33.54987,
  longitude: 73.07968,
} as const;

/** Human-readable coordinates, used as the accessible fallback for the map. */
export const CLINIC_COORDINATES_DISPLAY = `${CLINIC_LOCATION.latitude}, ${CLINIC_LOCATION.longitude}`;

/**
 * The approved promotional summary, supplied by the clinic owner.
 *
 * Kept as one constant so the same sentence can appear on the home hero, the
 * about page and the appointment banner without drifting apart (spec AC-13).
 */
export const CLINIC_SERVICE_SUMMARY =
  "Providing professional care for pregnancy, women's health, infertility, family planning, menopause, normal & C-section deliveries, and gynecological surgeries.";

/**
 * The same sentence as a clause that continues from the doctor's name, e.g.
 * "Dr. Saleha Ibtisam provides professional care for ...".
 * Split out so the wording can never drift between the two forms.
 */
export const CLINIC_SERVICE_SUMMARY_SENTENCE =
  CLINIC_SERVICE_SUMMARY.replace(/^Providing/, 'provides');

/**
 * One-line location + hours summary used in headers, footers and banners.
 * Rendered as text rather than emoji so it stays readable for screen readers.
 */
export const CLINIC_QUICK_SUMMARY = {
  location: 'Kotha Kala Road, Morgah, Rawalpindi (Near Citilab)',
  hours: 'Clinic Time: 6:00 PM – 9:00 PM',
} as const;

/** Bookable clinic slots. `ANY_TIME` is the flexible catch-all option. */
export const CLINIC_TIME_SLOTS = [
  { value: 'any', label: 'Any time between 6–9 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
] as const;

/** Default WhatsApp appointment-inquiry message (encoded by the helper). */
export const WHATSAPP_APPOINTMENT_MESSAGE =
  'Assalam-o-Alaikum. I would like to request an appointment with Dr. Saleha Ibtisam at Specialist Clinic, Morgah, Rawalpindi. Please let me know the available date and time between 6:00 PM and 9:00 PM. Thank you.';

export const defaultClinicSettings: ClinicSettings = {
  clinicName: 'Specialist Clinic',
  doctorName: 'Dr. Saleha Ibtisam',
  doctorDesignation: 'Consultant Gynecologist & Obstetrician',
  doctorQualifications: ['MBBS', 'FCPS'],
  carePhilosophy: 'Safe Care • Expert Guidance • Better Tomorrow',
  addressLine: 'Shop No. 5, Fazal Palaza, Kotha Kalan Rd, Kotha Kalan Morgah, Rawalpindi',
  addressLandmark: 'Near Citilab Morgah',
  addressCity: 'Rawalpindi, Pakistan',
  clinicHours: CLINIC_HOURS_DISPLAY,
  phone: CLINIC_CONTACT.phone,
  phoneDisplay: CLINIC_CONTACT.phoneDisplay,
  alternatePhone: CLINIC_CONTACT.alternatePhone,
  alternatePhoneDisplay: CLINIC_CONTACT.alternatePhoneDisplay,
  whatsappNumber: CLINIC_CONTACT.whatsappNumber,
  whatsappDisplay: CLINIC_CONTACT.whatsappDisplay,
  notificationEmail: null,
  /**
   * Short map link is optional. When empty, `buildMapHref` uses the confirmed
   * coordinates instead, so a working map is always available.
   */
  mapUrl: null,
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
  },
  siteUrl: '',
};

export const CONTACT_SUBJECT_OPTIONS = [
  { value: 'appointment', label: 'Appointment' },
  { value: 'service-question', label: 'Service Question' },
  { value: 'general-inquiry', label: 'General Inquiry' },
] as const;

export const PATIENT_TYPE_OPTIONS = [
  { value: 'new', label: 'New Patient' },
  { value: 'returning', label: 'Returning Patient' },
] as const;

export const INQUIRY_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
] as const;

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export const CONTACT_FORM_MAX_MESSAGE = 1500;
export const APPOINTMENT_NOTE_MAX = 800;