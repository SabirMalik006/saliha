/** Server-side mirrors of the frontend validation rules. */

export function normalisePhone(input: string): string {
  let value = input.replace(/[\s\-().]/g, '');
  if (value.startsWith('+92')) value = `0${value.slice(3)}`;
  else if (value.startsWith('0092')) value = `0${value.slice(4)}`;
  return value;
}

export function isValidPakistaniPhone(input: string): boolean {
  const value = normalisePhone(input);
  if (!/^\d+$/.test(value)) return false;
  if (/^03\d{9}$/.test(value)) return true;
  if (/^0[2-5]\d{7,8}$/.test(value)) return true;
  if (/^[2-9]\d{6,7}$/.test(value)) return true;
  return false;
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(input.trim());
}

export function cleanText(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim();
}

export function cleanMultiline(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .trim();
}

/** Creates a URL-safe slug from a title. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
