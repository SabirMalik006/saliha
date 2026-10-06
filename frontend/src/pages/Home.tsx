import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Clock,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Container, Section, SectionHeading } from '@/components/common/Layout';
import { ServiceGrid } from '@/components/services/ServiceCard';
import { ConsultationBanner } from '@/components/contact/ConsultationBanner';
import { ClinicInfoStrip } from '@/components/contact/ContactActions';
import { GalleryGrid, GalleryLightbox } from '@/components/gallery/GalleryGrid';
import { PortraitSlot } from '@/components/common/SmartImage';
import {
  SkeletonGalleryGrid,
  SkeletonRegion,
  SkeletonServiceGrid,
} from '@/components/feedback/Skeletons';
import { Seo, buildPhysicianSchema } from '@/components/seo/Seo';
import { useSettings } from '@/context/SettingsContext';
import { useFeaturedServices } from '@/hooks/useServices';
import { useGallery } from '@/hooks/useGallery';
import { routes } from '@/routes/paths';
import { buildMapHref, buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { trackCtaClick } from '@/utils/analytics';
import { cn } from '@/utils/cn';
import {
  CLINIC_CONTACT,
  CLINIC_HOURS_DISPLAY,
  CLINIC_QUICK_SUMMARY,
  CLINIC_SERVICE_SUMMARY_SENTENCE,
  WHATSAPP_APPOINTMENT_MESSAGE,
} from '@/constants/clinic';

/**
 * Three-step booking path. Every detail here mirrors the clinic's documented
 * process (request → clinic confirms → evening visit); nothing is invented.
 */
const BOOKING_STEPS = [
  {
    icon: Phone,
    title: 'Request your appointment',
    description: `Call ${CLINIC_CONTACT.phoneDisplay}, send a WhatsApp message, or fill the online appointment form — whichever is easiest for you.`,
  },
  {
    icon: CalendarCheck,
    title: 'We confirm your time',
    description:
      'The clinic team contacts you to confirm the date and time. A request is only a booking once you hear back from us.',
  },
  {
    icon: Stethoscope,
    title: 'Visit the clinic',
    description: `Evening consultations run ${CLINIC_HOURS_DISPLAY} at Kotha Kala Road, Morgah, near Citilab, Rawalpindi.`,
  },
] as const;

const WHY_POINTS = [
  {
    icon: Stethoscope,
    title: 'Specialist Focus',
    description:
      'Consultant-level care focused specifically on women’s health and pregnancy.',
  },
  {
    icon: HeartHandshake,
    title: 'Clear, Respectful Guidance',
    description:
      'Consultations are explained in plain language so you understand what is suggested and why.',
  },
  {
    icon: Clock,
    title: 'Evening Clinic Hours',
    description:
      'Open 6:00 PM – 9:00 PM, so appointments fit around work and family responsibilities.',
  },
  {
    icon: MapPin,
    title: 'Convenient Morgah Location',
    description: 'On Kotha Kala Road near Citilab, easy to reach from across Rawalpindi.',
  },
  {
    icon: Phone,
    title: 'Direct Phone & WhatsApp',
    description:
      'Reach the clinic directly by phone or WhatsApp instead of waiting for a reply.',
  },
];

// The first two reasons sit in the left column with the clinic facts, so the
// two columns carry a similar number of cards and neither side ends short.
const WHY_POINTS_LEFT = WHY_POINTS.slice(0, 2);
const WHY_POINTS_RIGHT = WHY_POINTS.slice(2);

export default function HomePage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const featured = useFeaturedServices(8);
  const gallery = useGallery('all', 6);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const galleryPreview = gallery.items.slice(0, 6);

  const heroTrust = [
    { icon: BadgeCheck, label: 'Qualifications', value: settings.doctorQualifications.join(' • ') },
    { icon: Stethoscope, label: 'Specialist Focus', value: settings.doctorDesignation },
    { icon: Clock, label: 'Evening Clinic', value: settings.clinicHours },
    { icon: MapPin, label: 'Location', value: CLINIC_QUICK_SUMMARY.location },
  ];

  const jsonLd = buildPhysicianSchema({
    name: settings.doctorName,
    jobTitle: settings.doctorDesignation,
    medicalSchool: null,
    telephone: settings.phone,
    address: `${settings.addressLine}, ${settings.addressLandmark}, ${settings.addressCity}`,
    openingHours: 'Mo-Sa 18:00-21:00',
    priceRange: '$$',
  });

  return (
    <>
      <Seo
        title="Specialist Clinic | Dr. Saleha Ibtisam – Gynecologist in Rawalpindi"
        description="Consultant gynecology and obstetric care for pregnancy, women's health, infertility, family planning, menopause and deliveries in Morgah, Rawalpindi."
        path={routes.home}
        jsonLd={jsonLd}
      />

      {/* -------------------------------------------------- 1. Hero */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-28 h-[22rem] w-[22rem] rounded-full bg-pink-100/60 blur-2xl" />
          <div className="absolute -left-32 top-40 h-[20rem] w-[20rem] rounded-full bg-blue-100/70 blur-2xl" />
        </div>

        <Container className="relative pb-12 pt-6 sm:pb-14 sm:pt-8 lg:pb-14 lg:pt-9">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Nudged down so the copy sits optically centred against the portrait. */}
            <div className="mt-2 lg:col-span-6 lg:mt-8">
              <p
                className="inline-flex animate-fade-up flex-wrap items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-pink-700 sm:text-xs"
                style={{ animationDelay: '0ms' }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Specialist Clinic
                <span aria-hidden="true" className="text-pink-300">•</span>
                Women's Health &amp; Maternity Care
              </p>

              <h1
                id="hero-title"
                className="mt-5 animate-fade-up text-[2.125rem] leading-[1.1] tracking-[-0.02em] text-navy-800 sm:text-[2.6rem] lg:text-[3.15rem]"
                style={{ animationDelay: '70ms' }}
              >
                Expert Gynecology &amp; Obstetric Care in{' '}
                <span className="text-gradient-brand">Morgah, Rawalpindi</span>
              </h1>

              <p
                className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-ink-soft sm:text-[1.0625rem] sm:leading-[1.7]"
                style={{ animationDelay: '140ms' }}
              >
                Dr. Saleha Ibtisam {CLINIC_SERVICE_SUMMARY_SENTENCE}
              </p>

              <div
                className="mt-7 flex animate-fade-up flex-col gap-3 sm:flex-row sm:flex-wrap"
                style={{ animationDelay: '210ms' }}
              >
                <ButtonLink
                  to={routes.bookAppointment}
                  variant="accent"
                  size="lg"
                  className="w-full sm:w-auto"
                  leftIcon={<CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />}
                >
                  Book Appointment
                </ButtonLink>
                <a
                  href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-6 text-base font-semibold text-green-700 shadow-sm transition-colors hover:bg-green-50 sm:w-auto"
                >
                  <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                  WhatsApp: {settings.whatsappDisplay}
                </a>
              </div>

            </div>

            {/* Hero visual — doctor cutout portrait on a soft brand backdrop. */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto mt-4 max-w-md animate-fade-up sm:mt-0" style={{ animationDelay: '280ms' }}>
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-100/70 via-transparent to-pink-100/70 blur-xl" aria-hidden="true" />

                {/* Floating quick-fact chips — the details patients look for first. */}
                <span className="absolute -left-4 top-8 z-10 hidden items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-navy-800 shadow-lg sm:inline-flex lg:-left-8">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Evening Clinic · {settings.clinicHours}
                </span>
                <a
                  href={buildPhoneHref(settings.phone)}
                  className="absolute -right-4 bottom-44 z-10 hidden items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-navy-800 shadow-lg transition-colors hover:text-pink-600 sm:inline-flex lg:-right-8"
                >
                  <Phone className="h-3.5 w-3.5 text-pink-500" aria-hidden="true" />
                  {settings.phoneDisplay}
                </a>

                <div className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-blue-50 via-white to-pink-50 shadow-xl">
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-pink-100/80 blur-2xl" />
                    <div className="absolute -left-12 top-1/3 h-40 w-40 rounded-full bg-blue-100/80 blur-2xl" />
                  </div>

                  <img
                    src="/images/doctor/dr-saleha.png"
                    alt={`Portrait of ${settings.doctorName}, ${settings.doctorDesignation}`}
                    width={820}
                    height={1199}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="relative mx-auto block h-[360px] w-auto max-w-full object-contain object-bottom sm:h-[400px] lg:h-[410px]"
                  />

                  <div className="relative border-t border-line/70 bg-white/85 px-5 py-4 text-center backdrop-blur-sm sm:px-6 sm:py-5">
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-pink-600">
                      {settings.doctorDesignation}
                    </p>
                    <p className="mt-1.5 font-display text-xl font-bold text-navy-800 sm:text-[1.375rem]">
                      {settings.doctorName}
                    </p>
                    <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {settings.doctorQualifications.map((qualification) => (
                        <li
                          key={qualification}
                          className="inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-bold text-navy-700 ring-1 ring-inset ring-navy-100"
                        >
                          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                          {qualification}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust strip — four verified facts as compact gradient-accent stat cards. */}
          <ul
            className="relative mt-8 grid animate-fade-up grid-cols-2 gap-4 sm:gap-5 lg:mt-10 lg:grid-cols-4"
            style={{ animationDelay: '360ms' }}
            aria-label="Clinic at a glance"
          >
            {heroTrust.map((item) => (
              <li
                key={item.label}
                className="group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-5 text-center shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6"
              >
                {/* Top brand accent */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-pink-500 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                />
                {/* Soft corner glow that warms up on hover */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-blue-50/70 blur-2xl transition-colors duration-300 group-hover:bg-pink-50/80"
                />

                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 via-white to-pink-50 text-blue-600 shadow-sm ring-1 ring-inset ring-blue-100 transition-transform duration-200 group-hover:scale-105">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>

                <p className="relative mt-3.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-ink-faint">
                  {item.label}
                </p>
                {/* text-balance keeps the long location/designation strings even */}
                <p className="relative mt-1.5 text-sm font-semibold leading-snug text-balance text-navy-800 sm:text-[0.9375rem]">
                  {item.value}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ------------------------------- 2. Doctor introduction */}
      <Section tone="white" padding="lg" labelledBy="doctor-intro-title">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <PortraitSlot
                imageUrl="/images/doctor/dr-saleha.png"
                imageAlt={`Portrait of ${settings.doctorName}`}
                caption={`${settings.doctorName} — ${settings.doctorDesignation}`}
                className="mx-auto max-w-xs lg:max-w-none"
              />
            </div>

            <div className="lg:col-span-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
                About the Doctor
              </p>
              <h2
                id="doctor-intro-title"
                className="mt-3 text-[1.75rem] leading-tight text-navy-800 sm:text-[2.125rem]"
              >
                Meet {settings.doctorName}
              </h2>

              <p className="mt-2 text-base font-semibold text-blue-600">{settings.doctorDesignation}</p>

              <ul className="mt-5 flex flex-wrap gap-2.5">
                {settings.doctorQualifications.map((qualification) => (
                  <li key={qualification}>
                    <span className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-navy-100 bg-navy-50 px-4 text-sm font-bold text-navy-800">
                      <BadgeCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      {qualification}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft">
                Consultant Gynecologist &amp; Obstetrician with MBBS and FCPS qualifications,
                providing focused care across pregnancy, gynecology, fertility, family planning and
                menopause. The clinic is located on Kotha Kala Road, Morgah, Rawalpindi, near
                Citilab.
              </p>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
                Consultations are focused, unhurried and explained in plain language, with evening
                availability from {settings.clinicHours}.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  to={routes.about}
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                  rightIcon={<ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />}
                >
                  Learn More About Doctor
                </ButtonLink>
                <a
                  href={buildPhoneHref(settings.phone)}
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-line bg-white px-6 text-base font-semibold text-navy-800 transition-colors hover:bg-app sm:w-auto"
                >
                  <Phone className="h-4.5 w-4.5 text-pink-500" aria-hidden="true" />
                  Call {settings.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 3. Services */}
      <Section tone="app" padding="lg" labelledBy="services-title">
        <Container>
          <SectionHeading
            align="center"
            id="services-title"
            eyebrow="What We Treat"
            title="Women's Health Services"
            description="Consultations covering pregnancy, gynecology, fertility, family planning and menopause. Every service below can be requested as an evening appointment."
            action={
              <ButtonLink
                to={routes.services}
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                View All Services
              </ButtonLink>
            }
          />

          <div className="mt-10 sm:mt-12">
            {featured.isLoading ? (
              <SkeletonRegion
                label="Loading services"
                className="[&>*]:opacity-100"
              >
                <SkeletonServiceGrid count={8} columns={4} />
              </SkeletonRegion>
            ) : featured.error ? (
              <div
                role="alert"
                className="flex flex-col items-center rounded-2xl border border-pink-200 bg-pink-50 px-6 py-12 text-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-pink-600 shadow-sm">
                  <Stethoscope className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-navy-800">
                  We could not load the services list right now.
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                  This is a temporary connection issue, not a clinic change. Open the full services
                  page, or ask us directly and we will guide you.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <ButtonLink to={routes.services} variant="primary" size="md">
                    Go to Services
                  </ButtonLink>
                  <a
                    href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            ) : featured.services.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-12 text-center">
                <p className="text-sm text-ink-soft">
                  No published services are available yet. Please contact the clinic on{' '}
                  <a
                    href={buildPhoneHref(settings.phone)}
                    className="font-semibold text-blue-600 underline underline-offset-4"
                  >
                    {settings.phoneDisplay}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <ServiceGrid services={featured.services} variant="compact" columns={4} />
            )}
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 4. Why choose us */}
      <Section tone="white" padding="lg" labelledBy="why-title">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Why Specialist Clinic"
            title="Care That Puts You First"
            description="We keep the process straightforward: specialist consultations, clear guidance and direct ways to reach the clinic."
            id="why-title"
          />

          {/* Five reason cards plus two fact cards = seven items, split 4 / 3
              across the two columns so both sides end at the same height with
              no leftover gap. Each column is an equal-rows grid, and the last
              card on the right spans both columns to close the row cleanly. */}
          <div className="mt-10 grid items-stretch gap-5 sm:gap-6 lg:grid-cols-2">
            <ul className="grid auto-rows-fr gap-5">
              <li className="group flex items-center gap-4 rounded-2xl border border-line bg-gradient-to-b from-blue-50 via-white to-white p-5 shadow-sm lg:p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-800 text-white shadow-sm transition-colors duration-200 group-hover:bg-navy-900">
                  <Clock className="h-5.5 w-5.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blue-700">
                    Evening clinic
                  </p>
                  <p className="mt-1 text-lg font-semibold text-navy-800">
                    {settings.clinicHours}
                  </p>
                </div>
              </li>

              <li className="group flex items-center gap-4 rounded-2xl border border-line bg-gradient-to-b from-pink-50 via-white to-white p-5 shadow-sm lg:p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-800 text-white shadow-sm transition-colors duration-200 group-hover:bg-navy-900">
                  <MapPin className="h-5.5 w-5.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-pink-700">
                    Location
                  </p>
                  <p className="mt-1 text-lg font-semibold text-navy-800 text-balance">
                    {settings.addressLandmark}, Morgah
                  </p>
                </div>
              </li>

              {WHY_POINTS_LEFT.map((point) => (
                <li
                  key={point.title}
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-colors duration-200 group-hover:bg-navy-800 group-hover:text-white">
                    <point.icon className="h-5.5 w-5.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold text-navy-800 text-balance">
                      {point.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft text-pretty">
                      {point.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <ul className="grid auto-rows-fr gap-5">
              {WHY_POINTS_RIGHT.map((point, index) => (
                <li
                  key={point.title}
                  className={cn(
                    'group flex items-center gap-4 rounded-2xl border border-line p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md lg:p-6',
                    index === 0 && 'bg-gradient-to-b from-blue-50 via-white to-white hover:border-blue-200',
                    index === 1 &&
                      'bg-gradient-to-b from-pink-50 via-white to-white hover:border-pink-200',
                    index === 2 &&
                      'bg-gradient-to-b from-app via-white to-white hover:border-green-200',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-colors duration-200',
                      index === 0 && 'bg-blue-600 group-hover:bg-navy-800',
                      index === 1 && 'bg-pink-600 group-hover:bg-navy-800',
                      index === 2 && 'bg-green-600 group-hover:bg-navy-800',
                    )}
                  >
                    <point.icon className="h-5.5 w-5.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold text-navy-800 text-balance">
                      {point.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft text-pretty">
                      {point.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Full-width booking call to action, below both columns. */}
          <div className="relative mt-10 flex flex-col items-center gap-5 overflow-hidden rounded-2xl bg-navy-800 px-6 py-8 text-center text-white shadow-md sm:px-8 lg:flex-row lg:justify-between lg:gap-10 lg:py-9 lg:text-left">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-pink-500/20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-blue-500/20"
            />

            <div className="relative">
              <h3 className="text-lg font-semibold text-white sm:text-xl">
                Ready to arrange a consultation?
              </h3>
              <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-relaxed text-blue-100 text-pretty">
                Request an appointment and the clinic team will confirm the date and time with you.
              </p>
            </div>

            <ButtonLink
              to={routes.bookAppointment}
              variant="accent"
              size="lg"
              className="relative w-full shrink-0 sm:w-auto"
              leftIcon={<CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />}
            >
              Book Appointment
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 5. How it works */}
      <Section tone="app" padding="lg" labelledBy="steps-title">
        <Container>
          <SectionHeading
            eyebrow="How It Works"
            title="Booking an appointment takes three steps"
            description="No queues and no guesswork — reach the clinic directly and the team confirms your date and time."
            id="steps-title"
          />

          <ol className="mt-10 grid items-stretch gap-5 sm:mt-12 sm:grid-cols-3">
            {BOOKING_STEPS.map((step, index) => (
              <li
                key={step.title}
                className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-line bg-white p-6 text-center shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2 right-3 select-none font-display text-[3.75rem] font-bold leading-none text-navy-100"
                >
                  {`0${index + 1}`}
                </span>

                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800 text-white shadow-sm transition-colors duration-200 group-hover:bg-navy-900">
                  <step.icon className="h-5.5 w-5.5" aria-hidden="true" />
                </span>

                <h3 className="relative mt-5 text-lg font-semibold text-navy-800 text-balance">
                  {step.title}
                </h3>
                <p className="relative mt-2.5 text-sm leading-relaxed text-ink-soft text-pretty">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-7 text-center text-sm text-ink-soft">
            An appointment request is not a confirmed booking — the clinic team contacts you to
            confirm the date and time.
          </p>
        </Container>
      </Section>

      {/* ------------------------------- 6. Conversion banner */}
      <Section tone="white" padding="md">
        <Container>
          <ConsultationBanner footnote={`Clinic time: ${settings.clinicHours}`} />
        </Container>
      </Section>

      {/* ------------------------------- 7. Clinic information strip */}
      <Section tone="subtle" padding="lg" labelledBy="clinic-info-title">
        <Container>
          <SectionHeading
            eyebrow="Clinic Information"
            title="Address, Timings &amp; Contact"
            description="Everything you need to reach Specialist Clinic in Morgah, Rawalpindi."
            id="clinic-info-title"
          />

          <div className="mt-10">
            <ClinicInfoStrip layout="grid" />
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 8. Gallery preview */}
      <Section tone="white" padding="lg" labelledBy="gallery-preview-title">
        <Container>
          <SectionHeading
            eyebrow="Gallery"
            title="Inside Specialist Clinic"
            description="A preview of images from the clinic. Tap any image to view it larger."
            action={
              <ButtonLink
                to={routes.gallery}
                variant="outline"
                size="md"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                View Gallery
              </ButtonLink>
            }
          />

          <div className="mt-10">
            {gallery.isLoading ? (
              <SkeletonRegion label="Loading gallery images">
                <SkeletonGalleryGrid count={6} preview />
              </SkeletonRegion>
            ) : galleryPreview.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line-strong bg-app px-6 py-12 text-center text-sm text-ink-soft">
                Clinic photographs have not been published yet.
              </p>
            ) : (
              <GalleryGrid
                items={galleryPreview}
                preview
                onOpen={setPreviewIndex}
                onViewAll={() => navigate(routes.gallery)}
                className="[&_button]:cursor-pointer"
              />
            )}
          </div>
        </Container>
      </Section>

      <GalleryLightbox
        items={galleryPreview}
        activeIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onNavigate={setPreviewIndex}
      />

      {/* ------------------------------- 9. Contact & location preview */}
      <Section tone="app" padding="lg" labelledBy="contact-preview-title">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Visit the Clinic"
            title="Contact &amp; Location"
            description={`The clinic is on Kotha Kala Road in Morgah, close to Citilab. Evening consultations run from ${settings.clinicHours}.`}
            id="contact-preview-title"
            className="max-w-3xl"
          />

          {/* Equal-height columns: `items-stretch` (grid default) plus `h-full`
              on each card makes both columns match regardless of content
              length, so the edges line up at every breakpoint. */}
          <div className="mt-10 grid items-stretch gap-5 sm:gap-6 lg:grid-cols-2">
            {/* -------------------------------------- Find the clinic */}
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-blue-50 via-white to-white p-6 shadow-sm sm:p-7">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-2xl" />
              </div>

              <div className="relative flex flex-1 flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-800 text-white shadow-sm">
                  <MapPin className="h-5.5 w-5.5" aria-hidden="true" />
                </span>

                <p className="mt-4 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-blue-700">
                  Address
                </p>

                <address className="mt-2 max-w-md text-[0.9375rem] not-italic leading-relaxed text-ink-soft text-balance">
                  {settings.addressLine}
                  <br />
                  {settings.addressLandmark}
                  <br />
                  {settings.addressCity}
                </address>

                <a
                  href={buildMapHref(settings.mapUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackCtaClick('map', {
                      location: 'home-contact-preview',
                      label: 'Get directions',
                    })
                  }
                  className="group/link mt-5 inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 text-sm font-semibold text-navy-800 shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  Get Directions
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                    aria-hidden="true"
                  />
                  <span className="sr-only">(opens Google Maps in a new tab)</span>
                </a>

                {/* `mt-auto` keeps these pinned to the bottom edge so both
                    columns finish at the same height. */}
                <div className="mt-auto grid w-full gap-4 pt-6 sm:grid-cols-2 sm:gap-5">
                  <div className="group flex items-center gap-3.5 rounded-xl border border-line bg-white/70 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-navy-800 group-hover:text-white">
                      <Clock className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-faint">
                        Opening Hours
                      </p>
                      <p className="mt-0.5 text-[0.9375rem] font-semibold text-navy-800">
                        {settings.clinicHours}
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-center gap-3.5 rounded-xl border border-line bg-white/70 p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600 transition-colors group-hover:bg-pink-500 group-hover:text-white">
                      <MapPin className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-ink-faint">
                        Area
                      </p>
                      <p className="mt-0.5 text-[0.9375rem] font-semibold text-navy-800">
                        Morgah, Rawalpindi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------- Reach the clinic */}
            <div className="flex h-full flex-col gap-4">
              <div className="flex flex-1 flex-col rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-7">
                <h3 className="text-lg font-semibold text-navy-800">Talk to the clinic</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  For anything urgent, please call rather than requesting an appointment online.
                </p>

                <div className="mt-5 flex flex-col gap-2.5">
                  <ButtonLink
                    to={routes.bookAppointment}
                    variant="accent"
                    size="lg"
                    fullWidth
                    leftIcon={<CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />}
                  >
                    Book Appointment
                  </ButtonLink>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <a
                      href={buildPhoneHref(settings.phone)}
                      onClick={() =>
                        trackCtaClick('phone', {
                          location: 'home-contact-preview',
                          label: settings.phoneDisplay,
                        })
                      }
                      className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy-800 transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <Phone
                        className="h-4 w-4 text-pink-500 transition-colors group-hover:text-pink-600"
                        aria-hidden="true"
                      />
                      Call {settings.phoneDisplay}
                    </a>
                    <a
                      href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackCtaClick('whatsapp', {
                          location: 'home-contact-preview',
                          label: settings.whatsappDisplay,
                        })
                      }
                      className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                    >
                      <MessageCircle
                        className="h-4 w-4 transition-colors group-hover:text-green-600"
                        aria-hidden="true"
                      />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <Link
                to={routes.contact}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-navy-800 p-6 text-white shadow-sm transition-colors hover:bg-navy-900"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-pink-500/20"
                />
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Navigation className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="block text-[0.9375rem] font-semibold">
                    Full contact details and directions
                  </span>
                  <span className="mt-0.5 block text-sm text-blue-200">
                    Map, alternate number and enquiry form
                  </span>
                </span>
                <ArrowRight
                  className="relative h-4.5 w-4.5 shrink-0 text-pink-200 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 10. Footer lives in PublicLayout */}
    </>
  );
}