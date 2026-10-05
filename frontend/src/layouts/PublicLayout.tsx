import { Outlet } from 'react-router-dom';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { Footer } from '@/components/navigation/Footer';
import { ScrollToTop } from '@/components/navigation/ScrollToTop';
import { DevModeBanner } from '@/components/common/DevModeBanner';

/** Public-facing shell: header, main landmark, footer. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>

      <DevModeBanner />

      <PublicHeader />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}