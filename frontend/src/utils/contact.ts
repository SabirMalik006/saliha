/** Phone / WhatsApp link builders — one place, used everywhere. */

import {
  CLINIC_CONTACT,
  CLINIC_LOCATION,
  WHATSAPP_APPOINTMENT_MESSAGE,
} from '@/constants/clinic';

/**
 * Google Maps directions link built from the clinic's confirmed coordinates.
 * Falls back to the shared location whenever the admin has not set a
 * short-link, so a map is always available.
 */
export function buildMapHref(url?: string | null): string {
  if (url && /^https?:\/\//i.test(url)) return url;
  const { latitude, longitude } = CLINIC_LOCATION;
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/** Search pin, used for the embedded map and "view on map" links. */
export function buildMapSearchHref(): string {
  const { latitude, longitude } = CLINIC_LOCATION;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function buildPhoneHref(number: string): string {
  const digits = number.replace(/[^\d+]/g, '');
  return `tel:${digits}`;
}

export function buildWhatsAppHref(
  number: string = CLINIC_CONTACT.whatsappNumber,
  message: string = WHATSAPP_APPOINTMENT_MESSAGE,
): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildSmsHref(
  number: string = CLINIC_CONTACT.alternatePhone,
  body = '',
): string {
  const digits = number.replace(/\D/g, '');
  const encoded = body ? `&body=${encodeURIComponent(body)}` : '';
  return `sms:${digits}${encoded}`;
}