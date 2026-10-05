import {
  CONTACT_FORM_MAX_MESSAGE,
  INQUIRY_STATUS_OPTIONS,
  APPOINTMENT_STATUS_OPTIONS,
} from '@/constants/clinic';
import type { AppointmentStatus, InquiryStatus } from '@/types';

/** YYYY-MM-DD in the visitor's local timezone (not UTC). */
export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocalISO(): string {
  return toLocalISODate(new Date());
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative time for admin tables ("2 hours ago"). */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  return formatDate(value);
}

/** "18:30" -> "6:30 PM" */
export function formatTimeSlot(value: string | null | undefined): string {
  if (!value) return '—';
  if (value === 'any') return 'Any time between 6–9 PM';

  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return value;

  const [, rawHours, rawMinutes] = match;
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes === 0 ? '00' : `${minutes}`.padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${suffix}`;
}

const inquiryStatusLabels = new Map<string, string>(
  INQUIRY_STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

const appointmentStatusLabels = new Map<string, string>(
  APPOINTMENT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

export function inquiryStatusLabel(value: InquiryStatus): string {
  return inquiryStatusLabels.get(value) ?? value;
}

export function appointmentStatusLabel(value: AppointmentStatus): string {
  return appointmentStatusLabels.get(value) ?? value;
}

export function truncate(text: string | null | undefined, max = 120): string {
  if (!text) return '';
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** Turn "Normal & C-Section Deliveries" -> "normal-c-section-deliveries" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function messageCount(value: number | null | undefined): string {
  if (!value) return '';
  return value > 999 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

export const MESSAGE_LIMITS = {
  contact: CONTACT_FORM_MAX_MESSAGE,
} as const;

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}