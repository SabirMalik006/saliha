import { http } from './apiClient';
import { defaultClinicSettings } from '@/constants/clinic';
import type { ClinicSettings } from '@/types';

function merge(base: ClinicSettings, patch: Partial<ClinicSettings>): ClinicSettings {
  return { ...base, ...patch, social: { ...base.social, ...(patch.social ?? {}) } };
}

/** Strips fields that must never reach the public website. */
function toPublicSettings(settings: ClinicSettings): ClinicSettings {
  const { notificationEmail: _email, ...rest } = settings;
  void _email;
  return merge(defaultClinicSettings, rest);
}

export const settingsApi = {
  /** Public clinic details used across the website header, footer and pages. */
  async getPublic(): Promise<ClinicSettings> {
    const payload = await http.get<Partial<ClinicSettings>>('/settings/public');
    return toPublicSettings(merge(defaultClinicSettings, payload));
  },

  /* ---- admin ---- */
  async getAdmin(): Promise<ClinicSettings> {
    const payload = await http.get<Partial<ClinicSettings>>('/admin/settings');
    return merge(defaultClinicSettings, payload);
  },

  async update(payload: Partial<ClinicSettings>): Promise<ClinicSettings> {
    const result = await http.put<Partial<ClinicSettings>>('/admin/settings', payload);
    return merge(defaultClinicSettings, result);
  },
};