import { useMemo } from 'react';
import { useAsync } from './useAsync';
import { galleryApi } from '@/services/galleryApi';
import type { GalleryCategory, GalleryItem } from '@/types';

/** Published gallery items, optionally narrowed to one real category. */
export function useGallery(category?: GalleryCategory | 'all', limit?: number) {
  const query = useAsync<GalleryItem[]>(
    () => galleryApi.listPublished({ category: category ?? 'all', limit }),
    [category ?? 'all', limit ?? 0],
  );

  const items = useMemo(() => query.data ?? [], [query.data]);

  /** Categories that actually exist in the returned data — never hardcoded. */
  const availableCategories = useMemo(() => {
    const counts = new Map<GalleryCategory, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  return { ...query, items, availableCategories };
}