import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { Footer } from '@/components/navigation/Footer';
import { ScrollToTop } from '@/components/navigation/ScrollToTop';
import { SkeletonPageBody, SkeletonRegion } from '@/components/feedback/Skeletons';

/**
 * Public-facing shell: header, main landmark, footer.
 *
 * The nested Suspense boundary matters: `App.tsx` also suspends on the first
 * route chunk. Without this, every internal navigation would blank the whole
 * page — header and footer included — instead of only the page body.
 */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>

      <PublicHeader />

      <main id="main-content" className="flex-1">
        <Suspense
          fallback={
            <SkeletonRegion label="Loading page" className="block">
              <SkeletonPageBody />
            </SkeletonRegion>
          }
        >
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}