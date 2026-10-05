import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Smartphone,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container, Section } from '@/components/common/Layout';
import { ContactQuickLinks, MapEmbed, MapLink } from '@/components/contact/ContactActions';
import { FormAlert, HoneypotField } from '@/components/forms/Field';
import { CharacterCount, Checkbox, SelectInput, TextArea, TextInput } from '@/components/forms/Inputs';
import { Seo } from '@/components/seo/Seo';
import { contactApi } from '@/services/contactApi';
import { normaliseApiError, type ApiError } from '@/services/apiClient';
import { contactSchema, type ContactFormValues } from '@/schemas';
import { CONTACT_SUBJECT_OPTIONS, CONTACT_FORM_MAX_MESSAGE } from '@/constants/clinic';
import { useSettings } from '@/context/SettingsContext';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { WHATSAPP_APPOINTMENT_MESSAGE } from '@/constants/clinic';

const SUCCESS_MESSAGE =
  'Thank you. Your message has been received. The clinic team will contact you if a response is required.';
const SERVER_ERROR_MESSAGE =
  'We could not submit the form right now. Please try again or contact the clinic by phone/WhatsApp.';

export default function ContactPage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      subject: 'general-inquiry',
      message: '',
      consent: undefined as unknown as true,
      company: '',
    },
  });

  const messageValue = watch('message') ?? '';

  // Belt-and-braces duplicate-submission guard.
  const submitLock = useRef(false);

  const subjectOptions = useMemo(
    () => CONTACT_SUBJECT_OPTIONS.map((option) => ({ ...option })),
    [],
  );

  useEffect(() => {
    if (isSubmitted) successRef.current?.focus();
  }, [isSubmitted]);

  const onSubmit = handleSubmit(async (values) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setServerError(null);

    try {
      await contactApi.submit({
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        subject: values.subject,
        message: values.message,
        consent: true,
        company: values.company ?? '',
      });

      setIsSubmitted(true);
      reset();
    } catch (error) {
      const apiError = normaliseApiError(error);
      setServerError(apiError);

      // Map server-side field errors onto the form where possible.
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          if (field === 'consent') setError('consent', { type: 'server', message });
          else if (field in values) {
            setError(field as keyof ContactFormValues, { type: 'server', message });
          }
        });
      }
    } finally {
      submitLock.current = false;
    }
  });

  return (
    <>
      <Seo
        title="Contact Specialist Clinic | Morgah, Rawalpindi"
        description="Contact Specialist Clinic in Morgah, Rawalpindi. Phone 051-5431070, WhatsApp 0331-0000643. Evening clinic hours 6:00 PM – 9:00 PM. Send a message online."
        path={routes.contact}
      />

      <section className="border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', to: routes.home },
              { label: 'Contact' },
            ]}
          />

          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">Contact</p>
            <h1 className="mt-3 text-[2rem] leading-[1.14] text-navy-800 sm:text-[2.5rem]">
              Contact Specialist Clinic
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">
              Call, send a WhatsApp message, or use the form below. The clinic team normally
              responds during clinic hours, {settings.clinicHours}.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="white" padding="lg">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* -------------------------------- Contact information */}
            <div className="lg:col-span-5">
              <h2 className="text-[1.5rem] text-navy-800 sm:text-[1.75rem]">
                Clinic Information
              </h2>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-line bg-app p-5">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-semibold text-navy-800">Address</h3>
                      <address className="mt-1.5 text-sm not-italic leading-relaxed text-ink-soft">
                        {settings.addressLine}
                        <br />
                        {settings.addressLandmark}
                        <br />
                        {settings.addressCity}
                      </address>
                    </div>
                  </div>
                  <div className="mt-5">
                    <MapLink />
                  </div>
                </div>

                <MapEmbed className="mt-5" />

                <div className="rounded-2xl border border-line bg-app p-5">
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-semibold text-navy-800">Clinic Hours</h3>
                      <p className="mt-1.5 text-sm text-ink-soft">{settings.clinicHours}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-navy-800">Contact Numbers</h3>
                  <div className="mt-3 space-y-1">
                    <a
                      href={buildPhoneHref(settings.phone)}
                      className="flex min-h-[48px] items-center gap-3 rounded-lg px-2 text-[0.9375rem] font-semibold text-navy-800 transition-colors hover:bg-app"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-pink-500" aria-hidden="true" />
                      <span className="flex-1">{settings.phoneDisplay}</span>
                      <span className="text-xs font-normal text-ink-faint">Clinic</span>
                    </a>
                    <a
                      href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[48px] items-center gap-3 rounded-lg px-2 text-[0.9375rem] font-semibold text-navy-800 transition-colors hover:bg-app"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0 text-green-500" aria-hidden="true" />
                      <span className="flex-1">WhatsApp {settings.whatsappDisplay}</span>
                      <span className="text-xs font-normal text-ink-faint">WhatsApp</span>
                    </a>
                    <a
                      href={buildPhoneHref(settings.alternatePhone)}
                      className="flex min-h-[48px] items-center gap-3 rounded-lg px-2 text-[0.9375rem] font-semibold text-navy-800 transition-colors hover:bg-app"
                    >
                      <Smartphone className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
                      <span className="flex-1">{settings.alternatePhoneDisplay}</span>
                      <span className="text-xs font-normal text-ink-faint">Alternate</span>
                    </a>
                  </div>

                  {settings.notificationEmail ? (
                    <a
                      href={`mailto:${settings.notificationEmail}`}
                      className="mt-3 flex min-h-[48px] items-center gap-3 rounded-lg px-2 text-[0.9375rem] font-semibold text-navy-800 transition-colors hover:bg-app"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                      {settings.notificationEmail}
                    </a>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-navy-700 bg-navy-800 p-5 text-white">
                <h3 className="text-sm font-semibold text-white">Prefer to book online?</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-blue-100">
                  Send an appointment request and the clinic team will confirm the date and time.
                </p>
                <ButtonLink
                  to={routes.bookAppointment}
                  variant="accent"
                  size="md"
                  fullWidth
                  className="mt-4"
                  leftIcon={<CalendarDays className="h-4 w-4" aria-hidden="true" />}
                >
                  Book Appointment
                </ButtonLink>
              </div>
            </div>

            {/* -------------------------------- Contact form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-md sm:p-7">
                <h2 className="text-[1.5rem] text-navy-800 sm:text-[1.75rem]">
                  Send Us a Message
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  All fields marked with <span aria-hidden="true">*</span> are required. Please
                  do not include medical reports or detailed medical history — you can discuss
                  that during your consultation.
                </p>

                {isSubmitted ? (
                  <div
                    ref={successRef}
                    tabIndex={-1}
                    role="status"
                    className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center"
                  >
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm">
                      <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-navy-800">Message received</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                      {SUCCESS_MESSAGE}
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          setIsSubmitted(false);
                          setServerError(null);
                        }}
                      >
                        Send Another Message
                      </Button>
                      <ButtonLink to={routes.services} variant="outline" size="md">
                        Browse Services
                      </ButtonLink>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
                    <div className="relative">
                      <HoneypotField register={register} />
                    </div>

                    {serverError ? (
                      <FormAlert
                        title={SERVER_ERROR_MESSAGE}
                        message={
                          serverError.isRateLimited
                            ? 'You have sent several messages in a short time. Please wait a little before trying again.'
                            : serverError.isValidation && serverError.fieldErrors
                              ? 'Some fields need attention — please check the highlighted inputs below.'
                              : undefined
                        }
                      />
                    ) : null}

                    <FormAlert
                      tone="info"
                      title="Before you send"
                      message="Messages are reviewed during clinic hours. For anything urgent, please call the clinic instead."
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextInput
                        label="Full Name"
                        required
                        autoComplete="name"
                        placeholder="e.g. Ayesha Khan"
                        error={errors.fullName?.message}
                        {...register('fullName')}
                      />
                      <TextInput
                        label="Phone / WhatsApp Number"
                        required
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="0300-1234567"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextInput
                        label="Email Address"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <SelectInput
                        label="Subject / Reason for Contact"
                        required
                        error={errors.subject?.message}
                        options={subjectOptions}
                        {...register('subject')}
                      />
                    </div>

                    <TextArea
                      label="Message"
                      required
                      rows={6}
                      maxLength={CONTACT_FORM_MAX_MESSAGE}
                      placeholder="How can the clinic team help you?"
                      error={errors.message?.message}
                      labelAdornment={<CharacterCount value={messageValue} max={CONTACT_FORM_MAX_MESSAGE} />}
                      {...register('message')}
                    />

                    <Checkbox
                      label={
                        <>
                          I agree to be contacted regarding this inquiry.{' '}
                          <span aria-hidden="true" className="text-pink-500">
                            *
                          </span>
                        </>
                      }
                      required
                      error={errors.consent?.message}
                      hint="Your details are used only to respond to this inquiry and to coordinate appointments."
                      {...register('consent')}
                    />

                    <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                        leftIcon={!isSubmitting ? <Mail className="h-4 w-4" aria-hidden="true" /> : undefined}
                      >
                        {isSubmitting ? 'Sending…' : 'Send Message'}
                      </Button>

                      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        Do not send medical reports or sensitive medical details through this form.
                      </p>
                    </div>
                  </form>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-app p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                  <AlertCircle className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  Other ways to reach us
                </h2>
                <div className="mt-3">
                  <ContactQuickLinks layout="row" />
                </div>
                <button
                  type="button"
                  onClick={() => navigate(routes.bookAppointment)}
                  className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline hover:underline-offset-4"
                >
                  Or request an appointment online
                </button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}