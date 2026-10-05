import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Facebook, Instagram, Linkedin, MapPin, MessageCircle, Phone, Smartphone } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/common/Button';
import { routes } from '@/routes/paths';
import { useSettings } from '@/context/SettingsContext';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';

const quickLinks = [
  { label: 'Home', to: routes.home },
  { label: 'About', to: routes.about },
  { label: 'Services', to: routes.services },
  { label: 'Gallery', to: routes.gallery },
  { label: 'Contact', to: routes.contact },
  { label: 'Book Appointment', to: routes.bookAppointment },
];

export function Footer() {
  const { settings } = useSettings();

  const socials = [
    { key: 'facebook', label: 'Facebook', href: settings.social.facebook, Icon: Facebook },
    { key: 'instagram', label: 'Instagram', href: settings.social.instagram, Icon: Instagram },
    { key: 'linkedin', label: 'LinkedIn', href: settings.social.linkedin, Icon: Linkedin },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="bg-navy-900 text-blue-100">
      <div className="container-page py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Logo
              tone="dark"
              variant="inline"
              clinicName={settings.clinicName}
              doctorName={settings.doctorName}
            />
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-blue-200">
              {settings.doctorDesignation} providing focused care across pregnancy, gynecology,
              fertility, family planning and menopause in Morgah, Rawalpindi.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-pink-200 ring-1 ring-inset ring-white/15">
              {settings.carePhilosophy}
            </p>

            {socials.length > 0 ? (
              <ul className="mt-6 flex items-center gap-2.5">
                {socials.map((social) => (
                  <li key={social.key}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-100 transition-colors hover:bg-pink-500 hover:text-white"
                      aria-label={`${social.label} (opens in a new tab)`}
                    >
                      <social.Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
              Quick Links
            </h2>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex min-h-[32px] items-center text-[0.9375rem] text-blue-200 transition-colors hover:text-white hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
              Contact
            </h2>
            <ul className="mt-5 space-y-3.5 text-[0.9375rem]">
              <li>
                <a
                  href={buildPhoneHref(settings.phone)}
                  className="inline-flex min-h-[32px] items-center gap-2.5 text-blue-200 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-pink-400" aria-hidden="true" />
                  {settings.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={buildWhatsAppHref(settings.whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[32px] items-center gap-2.5 text-blue-200 transition-colors hover:text-white"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-green-400" aria-hidden="true" />
                  WhatsApp {settings.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={buildPhoneHref(settings.alternatePhone)}
                  className="inline-flex min-h-[32px] items-center gap-2.5 text-blue-200 transition-colors hover:text-white"
                >
                  <Smartphone className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
                  Alternate {settings.alternatePhoneDisplay}
                </a>
              </li>
              <li className="inline-flex min-h-[32px] items-center gap-2.5 text-blue-200">
                <Clock className="h-4 w-4 shrink-0 text-pink-400" aria-hidden="true" />
                {settings.clinicHours}
              </li>
            </ul>
          </div>

          {/* Address + CTA */}
          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
              Address
            </h2>
            <address className="mt-5 flex gap-2.5 text-[0.9375rem] not-italic leading-relaxed text-blue-200">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-pink-400" aria-hidden="true" />
              <span>
                {settings.addressLine}
                <br />
                {settings.addressLandmark}
                <br />
                {settings.addressCity}
              </span>
            </address>

            <ButtonLink
              to={routes.bookAppointment}
              variant="accent"
              size="md"
              className="mt-6"
              leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
            >
              Book Appointment
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-blue-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.clinicName} – {settings.doctorName}. All
            rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li>
              <Link
                to={routes.privacyPolicy}
                className="inline-flex min-h-[32px] items-center transition-colors hover:text-white hover:underline hover:underline-offset-4"
              >
                Privacy Policy
              </Link>
            </li>
            <li className="inline-flex items-center gap-2 text-blue-400">
              <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
              Information on this website is general and not a substitute for medical advice.
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}