import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { CalendarDays, Clock, MapPin, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { publicNav, routes } from '@/routes/paths';
import { useSettings } from '@/context/SettingsContext';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cn } from '@/utils/cn';

const WHATSAPP_HINT_MESSAGE =
  'Assalam-o-Alaikum. I would like to ask about an appointment with Dr. Saleha Ibtisam.';

/** Shared easing so every navbar motion feels like one system. */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function PublicHeader() {
  const { settings } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const drawerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();

  useLockBodyScroll(isMenuOpen);

  // Thin reading-progress line pinned to the top of the header.
  const { scrollYProgress } = useScroll();
  const progressScale = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    drawerRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      {/* The header itself stays transparent once scrolled, so no full-width
          bar ever appears — only the rounded pill carries the background. At
          the top of a page the header picks up the first slice of the hero's
          own blue gradient, so the pill blends into it. Both gradients end in
          `transparent`, which keeps the join invisible. */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-[background-color] duration-300',
          isScrolled ? 'bg-transparent' : 'bg-gradient-to-b from-blue-50 from-[70%] to-transparent',
        )}
      >
        {/* Scroll progress — sits above the pill, like a hairline of light. */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progressScale }}
          className="h-[3px] origin-left bg-gradient-to-r from-pink-500 via-blue-500 to-navy-700"
        />

        <div className="container-page">
          <motion.nav
            aria-label="Primary"
            // The pill animates its own colour, border and lift rather than
            // the header bar, so scrolling turns the wide gradient strip into
            // a compact floating pill in one smooth motion.
            animate={{
              backgroundColor: isScrolled ? '#ffffff' : 'rgba(240, 245, 253, 0.6)',
              borderColor: isScrolled ? 'rgba(214, 222, 234, 1)' : 'rgba(240, 245, 253, 0)',
              boxShadow: isScrolled
                ? '0 18px 38px -24px rgba(16, 45, 85, 0.45)'
                : '0 18px 36px -24px rgba(16, 45, 85, 0.4)',
              scale: isScrolled ? 0.985 : 1,
            }}
            transition={{ duration: 0.35, ease: EASE }}
            className={cn(
              'mt-2.5 flex items-center justify-between gap-3 rounded-full border px-3 py-2.5 md:px-4',
              'bg-gradient-to-b from-blue-50 via-blue-50 to-blue-50/60',
            )}
          >
            <Link
              to={routes.home}
              aria-label="Specialist Clinic — home"
              className="min-w-0 shrink-0 rounded-full"
            >
              <Logo clinicName={settings.clinicName} doctorName={settings.doctorName} />
            </Link>

            {/* Desktop navigation — pill links with a gold-line style hover sweep. */}
            <ul className="hidden items-center gap-0.5 lg:flex">
              {publicNav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === routes.home}
                    className={({ isActive }) =>
                      cn(
                        'group relative inline-flex items-center rounded-full px-3.5 py-2 text-[0.875rem] font-medium transition-colors duration-300',
                        isActive
                          ? 'text-navy-800'
                          : 'text-navy-800/65 hover:text-navy-800',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute inset-x-3.5 bottom-1 h-px origin-center bg-pink-500 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                          )}
                        />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-1.5 md:gap-2">
              <a
                href={buildPhoneHref(settings.phone)}
                aria-label={`Call the clinic at ${settings.phoneDisplay}`}
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-line text-navy-800 transition-colors duration-300 hover:border-pink-300 hover:text-pink-600 sm:inline-flex"
              >
                <Phone className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
              </a>

              {/* Quick contact for the smallest screens, where the pill CTA is hidden. */}
              <a
                href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_HINT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Contact the clinic on WhatsApp at ${settings.whatsappDisplay}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-700 transition-colors duration-300 hover:bg-green-100 sm:hidden"
              >
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
              </a>

              <Link
                to={routes.bookAppointment}
                className="hidden h-10 items-center gap-2 rounded-full bg-pink-500 px-4 text-[0.875rem] font-semibold text-white shadow-[0_16px_36px_-22px_rgba(232,62,140,0.9)] transition-colors duration-300 hover:bg-pink-600 sm:inline-flex"
              >
                <CalendarDays className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                Book Appointment
              </Link>

              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/70 text-navy-800 transition-colors duration-300 hover:border-navy-300 lg:hidden"
              >
                {isMenuOpen ? (
                  <X className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
                ) : (
                  <Menu className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
                )}
              </button>
            </div>
          </motion.nav>
        </div>
      </header>

      {/* -------------------------------------------------- Mobile drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-navy-950/45 backdrop-blur-sm"
            />

            <motion.aside
              id="mobile-navigation"
              ref={drawerRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-y-0 right-0 flex w-[86%] max-w-[400px] flex-col overflow-y-auto border-l border-pink-200 bg-white px-6 pb-8 pt-6 shadow-[-30px_0_70px_-40px_rgba(16,45,85,0.6)] focus:outline-none"
            >
              <div className="flex items-center justify-between gap-3">
                <Logo clinicName={settings.clinicName} doctorName={settings.doctorName} />
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-navy-800 transition-colors hover:border-pink-300 hover:text-pink-600"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-app px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-navy-700 ring-1 ring-inset ring-line">
                  <Clock className="h-3.5 w-3.5 text-pink-500" aria-hidden="true" />
                  {settings.clinicHours}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-app px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-navy-700 ring-1 ring-inset ring-line">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                  Morgah, Rawalpindi
                </span>
              </div>

              <nav aria-label="Mobile" className="mt-6">
                <ul className="flex flex-col">
                  {publicNav.map((item, index) => (
                    <motion.li
                      key={item.to}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + index * 0.05, duration: 0.5, ease: EASE }}
                      className="border-b border-line"
                    >
                      <NavLink
                        to={item.to}
                        end={item.to === routes.home}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between gap-3 py-4 font-display text-[1.3rem] font-semibold transition-colors duration-300',
                            isActive ? 'text-pink-600' : 'text-navy-800 hover:text-pink-600',
                          )
                        }
                      >
                        <span className="min-w-0">
                          {item.label}
                          <span className="mt-0.5 block text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
                            {item.description}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app text-navy-700 ring-1 ring-inset ring-line"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                            <path
                              d="M5 12h14m-6-6 6 6-6 6"
                              stroke="currentColor"
                              strokeWidth="1.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto flex flex-col gap-2.5 pt-8">
                <Link
                  to={routes.bookAppointment}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-pink-500 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-pink-600"
                >
                  <CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />
                  Book Appointment
                </Link>

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

                <p className="pt-2 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                  {settings.carePhilosophy}
                </p>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
