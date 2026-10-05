import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  ChevronDown,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Stethoscope,
  X,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { InitialAvatar } from '@/components/common/SmartImage';
import { SkeletonAdminList, SkeletonRegion } from '@/components/feedback/Skeletons';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/context/ToastContext';
import { routes } from '@/routes/paths';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cn } from '@/utils/cn';

const adminNav = [
  { to: routes.admin, label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: routes.adminServices, label: 'Services', Icon: Stethoscope, end: false },
  { to: routes.adminGallery, label: 'Gallery', Icon: Images, end: false },
  { to: routes.adminInquiries, label: 'Contact Inquiries', Icon: Mail, end: false },
  {
    to: routes.adminAppointments,
    label: 'Appointment Requests',
    Icon: CalendarClock,
    end: false,
  },
  { to: routes.adminSettings, label: 'Site Settings', Icon: Settings, end: false },
];

const PAGE_TITLES: Array<{ match: (path: string) => boolean; title: string }> = [
  { match: (p) => p === routes.admin, title: 'Dashboard' },
  { match: (p) => p.startsWith(routes.adminServices), title: 'Services Management' },
  { match: (p) => p.startsWith(routes.adminGallery), title: 'Gallery Management' },
  { match: (p) => p.startsWith(routes.adminInquiries), title: 'Contact Inquiries' },
  { match: (p) => p.startsWith(routes.adminAppointments), title: 'Appointment Requests' },
  { match: (p) => p.startsWith(routes.adminSettings), title: 'Site Settings' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(isSidebarOpen);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close the account menu when clicking outside it.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  const pageTitle =
    PAGE_TITLES.find((entry) => entry.match(location.pathname))?.title ?? 'Admin';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out', 'You have been logged out of the admin area.');
    } finally {
      navigate(routes.adminLogin, { replace: true });
    }
  };

  const sidebar = (
    <nav aria-label="Admin navigation" className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        <Link to={routes.admin} aria-label="Specialist Clinic admin dashboard">
          <Logo
            tone="dark"
            clinicName={settings.clinicName}
            doctorName="Admin Dashboard"
            className="[&_span]:text-white"
          />
        </Link>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-3">
        {adminNav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-blue-200 hover:bg-white/5 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.Icon
                    className={cn(
                      'h-[1.125rem] w-[1.125rem] shrink-0',
                      isActive ? 'text-pink-400' : 'text-blue-300',
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-blue-200 transition-colors hover:bg-pink-500/15 hover:text-white"
        >
          <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
          Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-app">
      <a href="#admin-content" className="sr-only-focusable">
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-900 lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] bg-navy-900 shadow-xl">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close navigation"
              className="absolute right-2 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg text-blue-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className="container-admin flex h-16 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
              aria-expanded={isSidebarOpen}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-navy-800 transition-colors hover:bg-app lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-ink-faint">
                {settings.clinicName}
              </p>
              <h1 className="truncate text-lg font-semibold text-navy-800">{pageTitle}</h1>
            </div>

            <Link
              to={routes.home}
              className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-navy-800 sm:inline"
            >
              View website
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                className="inline-flex min-h-[44px] items-center gap-2.5 rounded-xl border border-line px-2.5 py-1.5 transition-colors hover:bg-app"
              >
                <InitialAvatar name={user?.name ?? 'Admin'} size="sm" />
                <span className="hidden min-w-0 text-left leading-tight sm:block">
                  <span className="block max-w-[9rem] truncate text-sm font-semibold text-navy-800">
                    {user?.name}
                  </span>
                  <span className="block text-xs capitalize text-ink-soft">{user?.role}</span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
              </button>

              {isMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-lg"
                >
                  <div className="border-b border-line px-4 py-2.5">
                    <p className="truncate text-sm font-semibold text-navy-800">{user?.name}</p>
                    <p className="truncate text-xs text-ink-soft">{user?.email}</p>
                  </div>
                  <Link
                    to={routes.adminSettings}
                    role="menuitem"
                    className="flex min-h-[42px] items-center gap-2.5 px-4 text-sm text-ink-soft transition-colors hover:bg-app hover:text-navy-800"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Site Settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void handleLogout()}
                    className="flex min-h-[42px] w-full items-center gap-2.5 px-4 text-sm text-pink-600 transition-colors hover:bg-pink-50"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main id="admin-content" className="container-admin py-6 sm:py-8">
          <Suspense
            fallback={
              <SkeletonRegion label={`Loading ${pageTitle}`} className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="skeleton h-6 w-56" />
                    <div className="skeleton h-3.5 w-72" />
                  </div>
                  <div className="skeleton h-9 w-28 rounded-xl" />
                </div>
                <div className="skeleton h-12 w-full rounded-xl" />
                <SkeletonAdminList count={4} />
              </SkeletonRegion>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}