import { http } from './apiClient';

export interface UploadedImage {
  url: string;
  thumbnailUrl: string | null;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Standalone image upload, used by admin forms that need a URL back
 * (e.g. a service photo) rather than a database record.
 */
export const uploadsApi = {
  async image(
    file: File,
    options: { folder?: string; onProgress?: (percent: number) => void } = {},
  ): Promise<UploadedImage> {
    const formData = new FormData();
    formData.append('image', file);
    if (options.folder) formData.append('folder', options.folder);

    return http.post<UploadedImage>('/admin/uploads/image', formData, {
      onUploadProgress: (event: { loaded: number; total?: number }) => {
        if (!options.onProgress || !event.total) return;
        options.onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  },
};
