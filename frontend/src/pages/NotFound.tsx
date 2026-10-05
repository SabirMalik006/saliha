import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Home, MessageCircle, Phone, Search } from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Container } from '@/components/common/Layout';
import { Seo } from '@/components/seo/Seo';
import { useSettings } from '@/context/SettingsContext';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { WHATSAPP_APPOINTMENT_MESSAGE } from '@/constants/clinic';

const SUGGESTIONS = [
  {
    to: routes.home,
    label: 'Home',
    description: 'Clinic overview, services and timings',
    Icon: Home,
  },
  {
    to: routes.services,
    label: 'Services',
    description: 'Pregnancy, gynecology, fertility and more',
    Icon: Search,
  },
  {
    to: routes.contact,
    label: 'Contact',
    description: 'Address, phone and WhatsApp',
    Icon: Phone,
  },
  {
    to: routes.bookAppointment,
    label: 'Book Appointment',
    description: 'Request an evening consultation',
    Icon: CalendarDays,
  },
];

export default function NotFoundPage() {
  const { settings } = useSettings();
  const location = useLocation();

  return (
    <>
      <Seo
        title="Page Not Found | Specialist Clinic"
        description="The page you were looking for could not be found."
        path={location.pathname}
        noIndex
      />

      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[5rem] font-bold leading-none text-blue-100 sm:text-[7rem]">404</p>

          <h1 className="mt-4 text-[1.75rem] leading-tight text-navy-800 sm:text-[2.25rem]">
            We could not find that page
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
            The page you are looking for may have moved, or the address may be incorrect. Use the
            links below, or contact the clinic and we will point you to the right place.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink
              to={routes.home}
              variant="primary"
              size="lg"
              leftIcon={<ArrowLeft className="h-4.5 w-4.5" aria-hidden="true" />}
            >
              Back to Home
            </ButtonLink>
            <a
              href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-6 text-base font-semibold text-green-700 transition-colors hover:bg-green-100"
            >
              <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
              WhatsApp {settings.whatsappDisplay}
            </a>
          </div>
        </div>

        <nav aria-label="Suggested pages" className="mx-auto mt-14 max-w-4xl">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Try one of these pages
          </h2>

          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SUGGESTIONS.map((suggestion) => (
              <li key={suggestion.to}>
                <Link
                  to={suggestion.to}
                  className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-navy-800 group-hover:text-white">
                    <suggestion.Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-4 text-[0.9375rem] font-semibold text-navy-800 group-hover:text-blue-600">
                    {suggestion.label}
                  </span>
                  <span className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {suggestion.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-line bg-app p-6 text-center">
          <p className="text-sm text-ink-soft">
            Need help? Call the clinic on{' '}
            <a
              href={buildPhoneHref(settings.phone)}
              className="font-semibold text-navy-800 underline underline-offset-4 hover:text-blue-600"
            >
              {settings.phoneDisplay}
            </a>{' '}
            — open {settings.clinicHours}.
          </p>
        </div>
      </Container>
    </>
  );
}