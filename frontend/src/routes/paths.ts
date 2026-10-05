/**
 * Centralised route paths. Use these instead of hardcoded strings so URLs
 * stay consistent and easy to audit.
 */

export const routes = {
  home: '/',
  about: '/about',
  services: '/services',
  serviceDetail: (slug: string) => `/services/${slug}`,
  serviceDetailPattern: '/services/:slug',
  gallery: '/gallery',
  contact: '/contact',
  bookAppointment: '/book-appointment',
  privacyPolicy: '/privacy-policy',
  notFound: '*',

  adminLogin: '/admin/login',
  admin: '/admin',
  adminServices: '/admin/services',
  adminServiceNew: '/admin/services/new',
  adminServiceEdit: (id: string) => `/admin/services/${id}/edit`,
  adminServiceEditPattern: '/admin/services/:id/edit',
  adminGallery: '/admin/gallery',
  adminGalleryNew: '/admin/gallery/new',
  adminGalleryEdit: (id: string) => `/admin/gallery/${id}/edit`,
  adminGalleryEditPattern: '/admin/gallery/:id/edit',
  adminInquiries: '/admin/inquiries',
  adminAppointments: '/admin/appointments',
  adminSettings: '/admin/settings',
} as const;

export type PublicNavItem = {
  label: string;
  to: string;
  description: string;
};

export const publicNav: PublicNavItem[] = [
  { label: 'Home', to: routes.home, description: 'Specialist Clinic overview' },
  { label: 'About', to: routes.about, description: 'About Dr. Saleha Ibtisam' },
  { label: 'Services', to: routes.services, description: "Women's health services" },
  { label: 'Gallery', to: routes.gallery, description: 'Clinic gallery' },
  { label: 'Contact', to: routes.contact, description: 'Contact and location' },
];