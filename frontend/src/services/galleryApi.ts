import { http } from './apiClient';
import { toArray } from './servicesApi';
import type {
  GalleryCategory,
  GalleryItem,
  GalleryItemInput,
  ListParams,
} from '@/types';

/**
 * Gallery image upload.
 * Uses multipart/form-data so the backend can resize and convert to
 * WebP/AVIF server-side. Pass `onProgress` for real upload progress.
 */
async function uploadWithProgress(
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<GalleryItem> {
  const response = await http.post<GalleryItem>('/admin/gallery', formData, {
    onUploadProgress: (event: { loaded: number; total?: number }) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return response;
}

export const galleryApi = {
  /** Published gallery items only. */
  async listPublished(params?: {
    category?: GalleryCategory | 'all';
    limit?: number;
  }): Promise<GalleryItem[]> {
    const payload = await http.get<unknown>('/gallery', {
      params: {
        ...(params?.category && params.category !== 'all'
          ? { category: params.category }
          : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
      },
    });
    return toArray<GalleryItem>(payload);
  },

  /* ---- admin ---- */
  async adminList(params?: ListParams) {
    return http.get<unknown>('/admin/gallery', { params });
  },

  async create(
    payload: GalleryItemInput | FormData,
    onProgress?: (percent: number) => void,
  ): Promise<GalleryItem> {
    if (typeof FormData !== 'undefined' && payload instanceof FormData) {
      return uploadWithProgress(payload, onProgress);
    }
    return http.post<GalleryItem>('/admin/gallery', payload);
  },

  async update(id: string, payload: Partial<GalleryItemInput>): Promise<GalleryItem> {
    return http.patch<GalleryItem>(`/admin/gallery/${encodeURIComponent(id)}`, payload);
  },

  async remove(id: string): Promise<void> {
    await http.delete<unknown>(`/admin/gallery/${encodeURIComponent(id)}`);
  },
};