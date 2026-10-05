/* ==========================================================================
   Shared API / domain types
   ========================================================================== */

export type ServiceIconName =
  | 'pregnancy'
  | 'menstrual'
  | 'fertility'
  | 'family-planning'
  | 'delivery'
  | 'menopause'
  | 'surgery'
  | 'general'
  | 'checkup';

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  icon: ServiceIconName;
  imageUrl: string | null;
  imageAlt: string | null;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  seoTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ServiceInput = Omit<
  Service,
  'id' | 'createdAt' | 'updatedAt'
>;

export type GalleryCategory = 'clinic' | 'awareness' | 'events' | 'promotional';

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  'clinic',
  'awareness',
  'events',
  'promotional',
];

export interface GalleryItem {
  id: string;
  title: string;
  caption: string | null;
  altText: string;
  category: GalleryCategory;
  imageUrl: string;
  thumbnailUrl: string | null;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GalleryItemInput = Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>;

export type ContactSubject = 'appointment' | 'service-question' | 'general-inquiry';

export interface ContactInquiry {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  subject: ContactSubject;
  message: string;
  status: InquiryStatus;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export interface ContactInquiryInput {
  fullName: string;
  phone: string;
  email?: string;
  subject: ContactSubject;
  message: string;
  consent: true;
  /** Honeypot — must stay empty. Populated by bots only. */
  company?: string;
}

export type PatientType = 'new' | 'returning';

export type AppointmentStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface AppointmentRequest {
  id: string;
  patientName: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  preferredTime: string;
  serviceId: string | null;
  serviceName: string | null;
  patientType: PatientType;
  note: string | null;
  status: AppointmentStatus;
  confirmedDate: string | null;
  confirmedTime: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequestInput {
  patientName: string;
  phone: string;
  email?: string;
  preferredDate: string;
  preferredTime: string;
  serviceId?: string;
  patientType: PatientType;
  note?: string;
  consent: true;
  company?: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  linkedin: string;
}

export interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  doctorDesignation: string;
  doctorQualifications: string[];
  carePhilosophy: string;
  /** NOTE: spelling requires client confirmation */
  addressLine: string;
  addressLandmark: string;
  addressCity: string;
  /** Formatting is fixed to the documented role: 6:00 PM – 9:00 PM */
  clinicHours: string;
  phone: string;
  phoneDisplay: string;
  alternatePhone: string;
  alternatePhoneDisplay: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  notificationEmail: string | null;
  mapUrl: string | null;
  social: SocialLinks;
  siteUrl: string;
}

export interface DashboardSummary {
  newInquiries: number;
  totalInquiries: number;
  newAppointments: number;
  totalAppointments: number;
  publishedServices: number;
  totalServices: number;
  publishedGalleryItems: number;
  totalGalleryItems: number;
  recentInquiries: ContactInquiry[];
  recentAppointments: AppointmentRequest[];
}

export type UserRole = 'admin' | 'editor';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
}

/* ==========================================================================
   API envelope types
   ========================================================================== */

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorShape {
  message: string;
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}