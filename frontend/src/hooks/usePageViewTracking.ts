import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics';

/**
 * Emits a page_view event on every route change.
 * A no-op until a GA4 measurement ID is configured.
 */
export function usePageViewTracking(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
}