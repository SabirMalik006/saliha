import { http } from './apiClient';
import type { ListParams, Service } from '@/types';

/** Normalise `{ items: [...] }` and bare-array backend responses. */
function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === 'object' && 'items' in payload) {
    const items = (payload as { items: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return toArray<T>((payload as { data: unknown }).data);
  }
  return [];
}

export const servicesApi = {
  /** Published services only. */
  async listPublished(params?: Pick<ListParams, 'search'>): Promise<Service[]> {
    const payload = await http.get<unknown>('/services', {
      params: params?.search ? { search: params.search } : undefined,
    });
    return toArray<Service>(payload);
  },

  async listFeatured(limit = 8): Promise<Service[]> {
    const payload = await http.get<unknown>('/services/featured', { params: { limit } });
    return toArray<Service>(payload);
  },

  async getBySlug(slug: string): Promise<Service> {
    return http.get<Service>(`/services/${encodeURIComponent(slug)}`);
  },

  /* ---- admin ---- */
  async adminList(params?: ListParams) {
    return http.get<unknown>('/admin/services', { params });
  },

  async adminGet(id: string): Promise<Service> {
    return http.get<Service>(`/admin/services/${encodeURIComponent(id)}`);
  },

  async create(payload: unknown): Promise<Service> {
    return http.post<Service>('/admin/services', payload);
  },

  async update(id: string, payload: unknown): Promise<Service> {
    return http.patch<Service>(`/admin/services/${encodeURIComponent(id)}`, payload);
  },

  async remove(id: string): Promise<void> {
    await http.delete<unknown>(`/admin/services/${encodeURIComponent(id)}`);
  },

  async reorder(orderedIds: string[]): Promise<Service[]> {
    const payload = await http.post<unknown>('/admin/services/reorder', { ids: orderedIds });
    return toArray<Service>(payload);
  },
};

export { toArray };