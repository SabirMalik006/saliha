import { useMemo } from 'react';
import { useAsync } from './useAsync';
import { servicesApi } from '@/services/servicesApi';
import type { Service } from '@/types';

/** All published services (public Services page, admin dropdowns). */
export function usePublishedServices() {
  const query = useAsync<Service[]>(() => servicesApi.listPublished(), []);
  const services = useMemo(() => query.data ?? [], [query.data]);
  return { ...query, services };
}

/** Featured + published services (Home page grid). */
export function useFeaturedServices(limit = 8) {
  const query = useAsync<Service[]>(() => servicesApi.listFeatured(limit), [limit]);
  const services = useMemo(() => query.data ?? [], [query.data]);
  return { ...query, services };
}

/** Single published service by slug (Service Detail page). */
export function useServiceBySlug(slug: string | undefined) {
  return useAsync<Service>(
    async () => {
      if (!slug) throw new Error('Missing service slug.');
      return servicesApi.getBySlug(slug);
    },
    [slug],
    { enabled: Boolean(slug) },
  );
}