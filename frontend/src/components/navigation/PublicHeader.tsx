import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CalendarDays, Clock, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/common/Button';
import { publicNav, routes } from '@/routes/paths';
import { useSettings } from '@/context/SettingsContext';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cn } from '@/utils/cn';

const WHATSAPP_HINT_MESSAGE =
  'Assalam-o-Alaikum. I would like to ask about an appointment with Dr. Saleha Ibtisam.';

export function PublicHeader() {
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useLockBodyScroll(isMenuOpen);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      {/* Utility strip — hidden on small screens to protect vertical space. */}
      <div className="hidden bg-navy-900 text-blue-100 lg:block">
        <div className="container-page flex h-10 items-center justify-between text-[0.8125rem]">
          <p className="inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-pink-400" aria-hidden="true" />
            <span>
              Clinic Time: <span className="font-semibold text-white">{settings.clinicHours}</span>
            </span>
            <span aria-hidden="true" className="text-navy-500">
              |
            </span>
            <span className="truncate">{settings.addressLandmark}, Morgah, Rawalpindi</span>
          </p>

          <div className="flex items-center gap-5">
            <a
              href={buildPhoneHref(settings.phone)}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Phone className="h-3.5 w-3.5 text-pink-400" aria-hidden="true" />
              {settings.phoneDisplay}
            </a>
            <a
              href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_HINT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <MessageCircle className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
              {settings.whatsappDisplay}
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85',
          isScrolled ? 'border-line shadow-sm' : 'border-transparent',
        )}
      >
        <div className="container-page flex h-[4.25rem] items-center justify-between gap-3 lg:h-20">
          <Link
            to={routes.home}
            aria-label="Specialist Clinic — home"
            className="min-w-0 shrink-0 rounded-lg"
          >
            <Logo clinicName={settings.clinicName} doctorName={settings.doctorName} />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {publicNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === routes.home}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex min-h-[44px] items-center rounded-lg px-3.5 text-[0.9375rem] font-semibold transition-colors',
                        isActive
                          ? 'bg-blue-50 text-navy-800'
                          : 'text-ink-soft hover:bg-app hover:text-navy-800',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_HINT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-green-600 transition-colors hover:border-green-200 hover:bg-green-50 lg:hidden"
              aria-label={`Contact the clinic on WhatsApp at ${settings.whatsappDisplay}`}
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>

            <ButtonLink
              to={routes.bookAppointment}
              variant="accent"
              size="md"
              className="hidden sm:inline-flex"
              leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
            >
              Book Appointment
            </ButtonLink>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-navy-800 transition-colors hover:bg-app lg:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        <div
          id="mobile-navigation"
          className={cn(
            'overflow-hidden border-t border-line bg-white transition-[max-height,opacity] duration-300 lg:hidden',
            isMenuOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <nav aria-label="Mobile" className="container-page py-4">
            <ul className="flex flex-col gap-1">
              {publicNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === routes.home}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-[52px] flex-col justify-center rounded-xl px-4 transition-colors',
                        isActive
                          ? 'bg-blue-50 text-navy-800'
                          : 'text-navy-800 hover:bg-app',
                      )
                    }
                  >
                    <span className="text-[0.9375rem] font-semibold">{item.label}</span>
                    <span className="text-xs text-ink-soft">{item.description}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-col gap-2.5">
              <ButtonLink
                to={routes.bookAppointment}
                variant="accent"
                size="lg"
                fullWidth
                leftIcon={<CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />}
              >
                Book Appointment
              </ButtonLink>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={buildPhoneHref(settings.phone)}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
                >
                  <Phone className="h-4 w-4 text-pink-500" aria-hidden="true" />
                  Call
                </a>
                <a
                  href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_HINT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>

              <p className="pt-1 text-center text-xs text-ink-soft">
                {settings.clinicHours} · {settings.addressLandmark}
              </p>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}