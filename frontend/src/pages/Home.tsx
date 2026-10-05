import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { ButtonLink } from '@/components/common/Button';
import { Container, Section, SectionHeading } from '@/components/common/Layout';
import { ServiceGrid } from '@/components/services/ServiceCard';
import { ConsultationBanner } from '@/components/contact/ConsultationBanner';
import { ClinicInfoStrip, MapLink } from '@/components/contact/ContactActions';
import { GalleryGrid, GalleryLightbox } from '@/components/gallery/GalleryGrid';
import { SmartImage, PortraitSlot } from '@/components/common/SmartImage';
import { ClinicLogo } from '@/components/brand/ClinicLogo';
import { SkeletonGrid } from '@/components/feedback/States';
import { Seo, buildPhysicianSchema } from '@/components/seo/Seo';
import { useSettings } from '@/context/SettingsContext';
import { useFeaturedServices } from '@/hooks/useServices';
import { useGallery } from '@/hooks/useGallery';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import {
  CLINIC_QUICK_SUMMARY,
  CLINIC_SERVICE_SUMMARY_SENTENCE,
  WHATSAPP_APPOINTMENT_MESSAGE,
} from '@/constants/clinic';

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

export default function HomePage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const featured = useFeaturedServices(8);
  const gallery = useGallery('all', 6);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const galleryPreview = gallery.items.slice(0, 6);

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

        <Container className="relative py-12 sm:py-16 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <p className="inline-flex flex-wrap items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-pink-700 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Specialist Clinic
                <span aria-hidden="true" className="text-pink-300">•</span>
                Women's Health &amp; Maternity Care
              </p>

              <h1
                id="hero-title"
                className="mt-5 text-[2rem] leading-[1.12] tracking-[-0.02em] text-navy-800 sm:text-[2.5rem] lg:text-[3rem]"
              >
                Expert Gynecology &amp; Obstetric Care in{' '}
                <span className="text-gradient-brand">Morgah, Rawalpindi</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-[1.0625rem] sm:leading-[1.7]">
                Dr. Saleha Ibtisam {CLINIC_SERVICE_SUMMARY_SENTENCE}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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

              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-line bg-white/80 p-3.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                      Clinic Time
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-navy-800">
                      {settings.clinicHours}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-line bg-white/80 p-3.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pink-500" aria-hidden="true" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-faint">
                      Location
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-navy-800">
                      {CLINIC_QUICK_SUMMARY.location}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Hero visual — CTG trace motif plus approved-portrait slot. */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg">
                <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-100/70 via-transparent to-pink-100/70 blur-xl" aria-hidden="true" />

                <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-5 shadow-lg sm:p-6">
                  <div className="flex items-center gap-3">
                    <ClinicLogo
                      size="md"
                      className="h-16 w-16 rounded-xl ring-1 ring-inset ring-line sm:h-20 sm:w-20"
                      title=""
                    />
                    <div className="min-w-0">
                      <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-pink-600">
                        Consultant Gynecologist &amp; Obstetrician
                      </p>
                      <p className="mt-1.5 text-lg font-bold text-navy-800">
                        {settings.doctorName}
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
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

                  <div
                    className="mt-5 rounded-2xl border border-line bg-app p-4"
                    aria-hidden="true"
                  >
                    <p className="text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-faint">
                      Care Philosophy
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-navy-800 sm:text-[0.9375rem]">
                      {settings.carePhilosophy}
                    </p>
                    <svg viewBox="0 0 300 48" className="mt-3 h-10 w-full text-blue-400">
                      <path
                        d="M0 24h44l10-14 12 28 12-20 10 6h44l10-14 12 28 12-20 10 6h84"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------- 2. Doctor introduction */}
      <Section tone="white" padding="lg" labelledBy="doctor-intro-title">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <PortraitSlot
                imageUrl={null}
                imageAlt={null}
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
              <SkeletonGrid count={8} />
            ) : featured.error ? (
              <div
                role="alert"
                className="rounded-2xl border border-pink-200 bg-pink-50 px-6 py-10 text-center"
              >
                <p className="text-sm font-semibold text-navy-800">
                  We could not load the services list right now.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
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
              <p className="rounded-2xl border border-dashed border-line-strong bg-white px-6 py-10 text-center text-sm text-ink-soft">
                No published services are available yet. Please contact the clinic on{' '}
                <a
                  href={buildPhoneHref(settings.phone)}
                  className="font-semibold text-blue-600 underline underline-offset-4"
                >
                  {settings.phoneDisplay}
                </a>
                .
              </p>
            ) : (
              <ServiceGrid services={featured.services} variant="compact" />
            )}
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 4. Why choose us */}
      <Section tone="white" padding="lg" labelledBy="why-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
                Why Specialist Clinic
              </p>
              <h2
                id="why-title"
                className="mt-3 text-[1.75rem] leading-tight text-navy-800 sm:text-[2.125rem]"
              >
                Care That Puts You First
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
                We keep the process straightforward: specialist consultations, clear guidance and
                direct ways to reach the clinic.
              </p>

              <div className="mt-7 rounded-2xl border border-line bg-app p-5">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <p className="text-sm font-semibold text-navy-800">
                    Evening clinic: {settings.clinicHours}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <p className="text-sm font-semibold text-navy-800">
                    {settings.addressLandmark}, Morgah
                  </p>
                </div>
              </div>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              {WHY_POINTS.map((point) => (
                <li
                  key={point.title}
                  className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <point.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold text-navy-800">{point.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                      {point.description}
                    </p>
                  </div>
                </li>
              ))}

              <li className="rounded-2xl border border-navy-700 bg-navy-800 p-5 text-white shadow-md sm:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[0.9375rem] leading-relaxed text-blue-100">
                    Ready to arrange a consultation? Request an appointment and the clinic team
                    will confirm the date and time with you.
                  </p>
                  <ButtonLink
                    to={routes.bookAppointment}
                    variant="accent"
                    size="md"
                    className="shrink-0"
                    leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
                  >
                    Book Appointment
                  </ButtonLink>
                </div>
              </li>
            </ul>
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 5. Conversion banner */}
      <Section tone="white" padding="md">
        <Container>
          <ConsultationBanner footnote={`Clinic time: ${settings.clinicHours}`} />
        </Container>
      </Section>

      {/* ------------------------------- 6. Clinic information strip */}
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

      {/* ------------------------------- 7. Gallery preview */}
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
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="skeleton aspect-[4/3] w-full" />
                ))}
              </div>
            ) : galleryPreview.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line-strong bg-app px-6 py-10 text-center text-sm text-ink-soft">
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

      {/* ------------------------------- 8. Contact & location preview */}
      <Section tone="app" padding="lg" labelledBy="contact-preview-title">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
                Visit the Clinic
              </p>
              <h2
                id="contact-preview-title"
                className="mt-3 text-[1.75rem] leading-tight text-navy-800 sm:text-[2.125rem]"
              >
                Contact &amp; Location
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft">
                The clinic is on Kotha Kala Road in Morgah, close to Citilab. Evening consultations
                run from {settings.clinicHours}.
              </p>

              <div className="mt-7 space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-navy-800">Address</p>
                    <address className="mt-1 text-sm not-italic leading-relaxed text-ink-soft">
                      {settings.addressLine}
                      <br />
                      {settings.addressLandmark}
                      <br />
                      {settings.addressCity}
                    </address>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-line pt-4">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-navy-800">Opening Hours</p>
                    <p className="mt-1 text-sm text-ink-soft">{settings.clinicHours}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <MapLink />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-navy-800">Talk to the clinic</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
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
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
                    >
                      <Phone className="h-4 w-4 text-pink-500" aria-hidden="true" />
                      Call {settings.phoneDisplay}
                    </a>
                    <a
                      href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-navy-800 p-6 text-white">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-pink-500/20"
                />
                <SmartImage
                  src={null}
                  alt=""
                  aspectRatio="16 / 7"
                  rounded="xl"
                  wrapperClassName="bg-white/5"
                />
                <p className="relative mt-4 text-[0.9375rem] font-semibold">
                  Full contact details and directions
                </p>
                <Link
                  to={routes.contact}
                  className="relative mt-2 inline-flex min-h-[32px] items-center gap-1.5 text-sm font-semibold text-pink-200 underline underline-offset-4 hover:text-white"
                >
                  Go to the Contact page
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ------------------------------- 9. Footer lives in PublicLayout */}
    </>
  );
}