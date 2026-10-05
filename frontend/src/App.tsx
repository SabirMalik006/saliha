import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import {
  RedirectIfAuthenticated,
  RequireAuth,
} from '@/components/navigation/RouteGuards';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { LoadingState } from '@/components/feedback/States';
import { usePageViewTracking } from '@/hooks/usePageViewTracking';
import { routes } from '@/routes/paths';

/* Route-level code splitting: the admin bundle is not fetched by visitors. */
const HomePage = lazy(() => import('@/pages/Home'));
const AboutPage = lazy(() => import('@/pages/About'));
const ServicesPage = lazy(() => import('@/pages/Services'));
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetail'));
const GalleryPage = lazy(() => import('@/pages/Gallery'));
const ContactPage = lazy(() => import('@/pages/Contact'));
const BookAppointmentPage = lazy(() => import('@/pages/BookAppointment'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicy'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

const AdminLoginPage = lazy(() => import('@/admin/AdminLogin'));
const AdminDashboardPage = lazy(() => import('@/admin/Dashboard'));
const ServicesManagementPage = lazy(() => import('@/admin/ServicesManagement'));
const ServiceFormPage = lazy(() => import('@/admin/ServiceForm'));
const GalleryManagementPage = lazy(() => import('@/admin/GalleryManagement'));
const GalleryFormPage = lazy(() => import('@/admin/GalleryForm'));
const InquiriesManagementPage = lazy(() => import('@/admin/InquiriesManagement'));
const AppointmentsManagementPage = lazy(() => import('@/admin/AppointmentsManagement'));
const SiteSettingsPage = lazy(() => import('@/admin/SiteSettings'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingState label="Loading page…" />
    </div>
  );
}

/** Emits a `page_view` event per route change (no-op without a GA4 ID). */
function Analytics() {
  usePageViewTracking();
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Analytics />
        <Routes>
          {/* ------------------------------ public ------------------------------ */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path={routes.about} element={<AboutPage />} />
            <Route path={routes.services} element={<ServicesPage />} />
            <Route path={routes.serviceDetailPattern} element={<ServiceDetailPage />} />
            <Route path={routes.gallery} element={<GalleryPage />} />
            <Route path={routes.contact} element={<ContactPage />} />
            <Route path={routes.bookAppointment} element={<BookAppointmentPage />} />
            <Route path={routes.privacyPolicy} element={<PrivacyPolicyPage />} />
          </Route>

          {/* ------------------------------ admin ------------------------------- */}
          <Route
            path={routes.adminLogin}
            element={
              <RedirectIfAuthenticated>
                <AdminLoginPage />
              </RedirectIfAuthenticated>
            }
          />

          <Route
            path={routes.admin}
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="services" element={<ServicesManagementPage />} />
            <Route path="services/new" element={<ServiceFormPage />} />
            <Route path="services/:id/edit" element={<ServiceFormPage />} />
            <Route path="gallery" element={<GalleryManagementPage />} />
            <Route path="gallery/new" element={<GalleryFormPage />} />
            <Route path="gallery/:id/edit" element={<GalleryFormPage />} />
            <Route path="inquiries" element={<InquiriesManagementPage />} />
            <Route path="appointments" element={<AppointmentsManagementPage />} />
            <Route path="settings" element={<SiteSettingsPage />} />
          </Route>

          {/* ------------------------------- 404 -------------------------------- */}
          <Route path={routes.notFound} element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}