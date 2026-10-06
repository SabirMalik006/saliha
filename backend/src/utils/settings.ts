import { SiteSettings } from '../models';

/** Always returns the single settings document, creating it on first use. */
export async function getSettingsDoc() {
  const existing = await SiteSettings.findOne({ singleton: 'site' });
  if (existing) return existing;
  return SiteSettings.create({ singleton: 'site' });
}

/** Removes fields that must never reach the public website. */
export function toPublicSettings(doc: Record<string, unknown>) {
  const {
    notificationEmail: _notificationEmail,
    internalNotes: _internalNotes,
    singleton: _singleton,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    id: _id,
    ...rest
  } = doc;
  return rest;
}
