/** Shared client-side validation helpers (Pakistan-focused). */

export function normalisePhone(input: string): string {
  let value = input.replace(/[\s\-().]/g, '');
  if (value.startsWith('+92')) value = `0${value.slice(3)}`;
  else if (value.startsWith('0092')) value = `0${value.slice(4)}`;
  return value;
}

/**
 * Accepts:
 *   03XX-XXXXXXX        Pakistani mobile
 *   +92 3XX XXXXXXXX    Pakistani mobile (international)
 *   051-5431070         Rawalpindi landline with area code
 *   7–8 digit local number
 */
export function isValidPakistaniPhone(input: string): boolean {
  const value = normalisePhone(input);
  if (!/^\d+$/.test(value)) return false;
  if (/^03\d{9}$/.test(value)) return true; // mobile
  if (/^0[2-5]\d{7,8}$/.test(value)) return true; // landline with area code
  if (/^[2-9]\d{6,7}$/.test(value)) return true; // local landline
  return false;
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(input.trim());
}

/** `YYYY-MM-DD` date string, comparing against the visitor's local clock. */
export function isPastDate(isoDate: string, today: string): boolean {
  return isoDate < today;
}

// Section 19 of the requirements document mandates these exact strings.
export const PHONE_ERROR_MESSAGE = 'Please enter a valid phone or WhatsApp number.';

export const EMAIL_ERROR_MESSAGE = 'Please enter a valid email address.';

/** Trim, collapse whitespace, and strip control characters. */
export function cleanText(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim();
}

/** Multi-line safe variant — preserves line breaks, removes other control chars. */
export function cleanMultiline(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .trim();
}