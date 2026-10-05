import { http } from './apiClient';
import type {
  AppointmentRequest,
  AppointmentStatus,
  ClinicSettings,
  ContactInquiry,
  DashboardSummary,
  GalleryItem,
  InquiryStatus,
  ListParams,
  Service,
  ServiceInput,
} from '@/types';

export const adminApi = {
  async dashboard(): Promise<DashboardSummary> {
    return http.get<DashboardSummary>('/admin/dashboard');
  },

  /* ---- services ---- */
  async listServices(params?: ListParams) {
    return http.get<unknown>('/admin/services', { params });
  },

  async getService(id: string): Promise<Service> {
    return http.get<Service>(`/admin/services/${encodeURIComponent(id)}`);
  },

  async createService(payload: ServiceInput): Promise<Service> {
    return http.post<Service>('/admin/services', payload);
  },

  async updateService(id: string, payload: ServiceInput): Promise<Service> {
    return http.put<Service>(`/admin/services/${encodeURIComponent(id)}`, payload);
  },

  async deleteService(id: string): Promise<void> {
    await http.delete(`/admin/services/${encodeURIComponent(id)}`);
  },

  async setServiceStatus(
    id: string,
    payload: { published?: boolean; featured?: boolean },
  ): Promise<Service> {
    return http.patch<Service>(`/admin/services/${encodeURIComponent(id)}`, payload);
  },

  async reorderServices(ids: string[]): Promise<Service[]> {
    return http.post<Service[]>('/admin/services/reorder', { ids });
  },

  /* ---- gallery ---- */
  async listGallery(params?: ListParams) {
    return http.get<unknown>('/admin/gallery', { params });
  },

  async getGalleryItem(id: string): Promise<GalleryItem> {
    return http.get<GalleryItem>(`/admin/gallery/${encodeURIComponent(id)}`);
  },

  async createGalleryItem(payload: FormData): Promise<GalleryItem> {
    return http.post<GalleryItem>('/admin/gallery', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async updateGalleryItem(
    id: string,
    payload: FormData | Partial<GalleryItem>,
  ): Promise<GalleryItem> {
    return http.patch<GalleryItem>(
      `/admin/gallery/${encodeURIComponent(id)}`,
      payload,
      payload instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined,
    );
  },

  async deleteGalleryItem(id: string): Promise<void> {
    await http.delete(`/admin/gallery/${encodeURIComponent(id)}`);
  },

  /* ---- inquiries ---- */
  async listInquiries(params?: ListParams) {
    return http.get<unknown>('/admin/inquiries', { params });
  },

  async getInquiry(id: string): Promise<ContactInquiry> {
    return http.get<ContactInquiry>(`/admin/inquiries/${encodeURIComponent(id)}`);
  },

  async updateInquiry(
    id: string,
    payload: { status: InquiryStatus; internalNotes: string | null },
  ): Promise<ContactInquiry> {
    return http.patch<ContactInquiry>(
      `/admin/inquiries/${encodeURIComponent(id)}`,
      payload,
    );
  },

  /* ---- appointments ---- */
  async listAppointments(params?: ListParams) {
    return http.get<unknown>('/admin/appointments', { params });
  },

  async getAppointment(id: string): Promise<AppointmentRequest> {
    return http.get<AppointmentRequest>(
      `/admin/appointments/${encodeURIComponent(id)}`,
    );
  },

  async updateAppointment(
    id: string,
    payload: {
      status: AppointmentStatus;
      confirmedDate?: string | null;
      confirmedTime?: string | null;
      internalNotes: string | null;
    },
  ): Promise<AppointmentRequest> {
    return http.patch<AppointmentRequest>(
      `/admin/appointments/${encodeURIComponent(id)}`,
      payload,
    );
  },

  /* ---- settings ---- */
  async getSettings(): Promise<ClinicSettings> {
    return http.get<ClinicSettings>('/admin/settings');
  },

  async updateSettings(payload: Partial<ClinicSettings>): Promise<ClinicSettings> {
    return http.put<ClinicSettings>('/admin/settings', payload);
  },
};