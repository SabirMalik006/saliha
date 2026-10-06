import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container, Section } from '@/components/common/Layout';
import { FormAlert, HoneypotField } from '@/components/forms/Field';
import {
  CharacterCount,
  Checkbox,
  SelectInput,
  TextArea,
  TextInput,
} from '@/components/forms/Inputs';
import { SuccessPanel } from '@/components/feedback/SuccessPanel';
import { Seo } from '@/components/seo/Seo';
import { appointmentsApi } from '@/services/appointmentsApi';
import { normaliseApiError, type ApiError } from '@/services/apiClient';
import { appointmentSchema, type AppointmentFormValues } from '@/schemas';
import {
  APPOINTMENT_NOTE_MAX,
  CLINIC_TIME_SLOTS,
  PATIENT_TYPE_OPTIONS,
  WHATSAPP_APPOINTMENT_MESSAGE,
} from '@/constants/clinic';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/context/ToastContext';
import { usePublishedServices } from '@/hooks/useServices';
import { routes } from '@/routes/paths';
import { buildPhoneHref, buildWhatsAppHref } from '@/utils/contact';
import { todayLocalISO } from '@/utils/format';

const SUCCESS_MESSAGE =
  'Your appointment request has been received. We will contact you soon to confirm your date and time.';
// Mandated wording, section 19 of the requirements document.
const SERVER_ERROR_MESSAGE =
  'We could not submit the form right now. Please try again or contact the clinic by phone/WhatsApp.';

export default function BookAppointmentPage() {
  const { settings } = useSettings();
  const { services } = usePublishedServices();
  const { success: successToast } = useToast();
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const today = todayLocalISO();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    mode: 'onBlur',
    defaultValues: {
      patientName: '',
      phone: '',
      email: '',
      preferredDate: '',
      preferredTime: 'any',
      serviceId: '',
      patientType: 'new',
      note: '',
      consent: undefined as unknown as true,
      company: '',
    },
  });

  const noteValue = watch('note') ?? '';
  const selectedDate = watch('preferredDate');

  // Keep the minimum selectable date in sync with the visitor's local clock.
  useEffect(() => {
    const input = document.getElementById('preferredDate') as HTMLInputElement | null;
    if (input) input.min = today;
  }, [today]);

  useEffect(() => {
    if (!isSubmitted) return;
    const panel = successRef.current;
    panel?.focus();
    // The form collapses when it is replaced, so the browser would otherwise
    // leave the visitor looking at whatever was below it. Bring the
    // confirmation into view explicitly so it cannot be missed.
    panel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isSubmitted]);

  const submitLock = useRef(false);

  const serviceOptions = useMemo(
    () => [
      ...services.map((service) => ({ value: service.id, label: service.title })),
      { value: 'other', label: 'Other' },
    ],
    [services],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setServerError(null);

    try {
      await appointmentsApi.requestAppointment({
        patientName: values.patientName,
        phone: values.phone,
        email: values.email || undefined,
        preferredDate: values.preferredDate,
        preferredTime: values.preferredTime,
        serviceId: values.serviceId && values.serviceId !== 'other' ? values.serviceId : undefined,
        patientType: values.patientType,
        note: values.note || undefined,
        consent: true,
        company: values.company ?? '',
      });

      setIsSubmitted(true);
      reset();
      successToast(
        'Thank you — your appointment request was sent',
        'We will contact you soon to confirm your date and time.',
      );
    } catch (error) {
      const apiError = normaliseApiError(error);
      setServerError(apiError);

      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          if (field === 'consent') setError('consent', { type: 'server', message });
          else if (field in values) {
            setError(field as keyof AppointmentFormValues, { type: 'server', message });
          }
        });
      }
    } finally {
      submitLock.current = false;
    }
  });

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    // The honeypot is off-screen and cannot be focused, but browsers and
    // password managers still autofill it. A value there would fail validation
    // invisibly and the visitor would never see why nothing happened, so drop
    // it before validating. Scripted spam hitting the API directly is still
    // rejected by the server-side check and by the rate limiter.
    if (getValues('company')) setValue('company', '');
    onSubmit(event);
  };

  return (
    <>
      <Seo
        title="Book Appointment | Dr. Saleha Ibtisam – Specialist Clinic"
        description="Request an appointment with Dr. Saleha Ibtisam at Specialist Clinic, Morgah, Rawalpindi. Evening clinic 6:00 PM – 9:00 PM. The clinic team will confirm your date and time."
        path={routes.bookAppointment}
      />

      <section className="border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <Container className="py-10 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', to: routes.home },
              { label: 'Book Appointment' },
            ]}
          />

          <div className="mt-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-pink-600">
              Appointments
            </p>
            <h1 className="mt-3 text-[2rem] leading-[1.14] text-navy-800 sm:text-[2.5rem]">
              Book an Appointment
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-[1.0625rem]">
              Request an appointment with Dr. Saleha Ibtisam at Specialist Clinic, Morgah,
              Rawalpindi. Clinic time is {settings.clinicHours}. The clinic team will contact you
              to confirm availability.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="white" padding="lg">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-line bg-white p-5 shadow-md sm:p-7">
                <h2 className="text-[1.5rem] text-navy-800 sm:text-[1.75rem]">
                  Appointment Request
                </h2>

                {/* Request vs confirmed — made explicit */}
                <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      This form sends a request, not a confirmed booking.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                      Availability is confirmed by the clinic team by phone or WhatsApp. There is
                      no online slot reservation in this phase.
                    </p>
                  </div>
                </div>

                {isSubmitted ? (
                  <SuccessPanel
                    panelRef={successRef}
                    title="Thank you! Your appointment request has been received"
                    message={SUCCESS_MESSAGE}
                    className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center outline-none"
                    actions={
                      <>
                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                          <a
                            href={buildPhoneHref(settings.phone)}
                            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 text-sm font-semibold text-navy-800 transition-colors hover:bg-app"
                          >
                            <Phone className="h-4 w-4 text-pink-500" aria-hidden="true" />
                            Call {settings.phoneDisplay}
                          </a>
                          <a
                            href={buildWhatsAppHref(
                              settings.whatsappNumber,
                              WHATSAPP_APPOINTMENT_MESSAGE,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                          >
                            <MessageCircle className="h-4 w-4" aria-hidden="true" />
                            WhatsApp
                          </a>
                        </div>

                        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => {
                              setIsSubmitted(false);
                              setServerError(null);
                              setValue('preferredDate', '');
                            }}
                          >
                            Make Another Request
                          </Button>
                          <ButtonLink to={routes.services} variant="outline" size="md">
                            Browse Services
                          </ButtonLink>
                        </div>
                      </>
                    }
                  />
                ) : (
                  <form onSubmit={handleFormSubmit} noValidate className="mt-6 space-y-5">
                    <div className="relative">
                      <HoneypotField register={register} />
                    </div>

                    {serverError ? (
                      <FormAlert
                        title={SERVER_ERROR_MESSAGE}
                        message={
                          serverError.isRateLimited
                            ? 'You have submitted several requests in a short time. Please wait before trying again.'
                            : undefined
                        }
                      />
                    ) : null}

                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextInput
                        label="Patient Full Name"
                        required
                        autoComplete="name"
                        placeholder="e.g. Ayesha Khan"
                        error={errors.patientName?.message}
                        {...register('patientName')}
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
                        label="Email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                      <SelectInput
                        label="New or Returning Patient"
                        required
                        error={errors.patientType?.message}
                        options={PATIENT_TYPE_OPTIONS.map((option) => ({ ...option }))}
                        {...register('patientType')}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <TextInput
                        label="Preferred Date"
                        required
                        type="date"
                        min={today}
                        error={errors.preferredDate?.message}
                        hint={
                          selectedDate && selectedDate < today
                            ? 'That date is in the past.'
                            : 'The clinic will confirm whether this date is available.'
                        }
                        {...register('preferredDate')}
                      />
                      <SelectInput
                        label="Preferred Time"
                        required
                        error={errors.preferredTime?.message}
                        options={CLINIC_TIME_SLOTS.map((slot) => ({ ...slot }))}
                        hint="Clinic hours: 6:00 PM – 9:00 PM."
                        {...register('preferredTime')}
                      />
                    </div>

                    <SelectInput
                      label="Service / Reason for Visit"
                      required
                      placeholder="Choose a service"
                      error={errors.serviceId?.message}
                      options={serviceOptions}
                      hint="Choose the closest match, or select Other."
                      {...register('serviceId')}
                    />

                    <TextArea
                      label="Short Note"
                      rows={4}
                      maxLength={APPOINTMENT_NOTE_MAX}
                      placeholder="Optional — a brief reason for your visit, or a preferred contact time."
                      error={errors.note?.message}
                      labelAdornment={
                        <CharacterCount value={noteValue} max={APPOINTMENT_NOTE_MAX} />
                      }
                      hint="Please do not include medical reports, test results or detailed medical history."
                      {...register('note')}
                    />

                    <Checkbox
                      label={
                        <>
                          I agree to be contacted regarding my appointment request.{' '}
                          <span aria-hidden="true" className="text-pink-500">
                            *
                          </span>
                        </>
                      }
                      required
                      error={errors.consent?.message}
                      hint="Your details are used only to coordinate this appointment."
                      {...register('consent')}
                    />

                    <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="submit"
                        variant="accent"
                        size="lg"
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                        leftIcon={
                          !isSubmitting ? (
                            <CalendarDays className="h-4.5 w-4.5" aria-hidden="true" />
                          ) : undefined
                        }
                      >
                        {isSubmitting ? 'Sending request…' : 'Request Appointment'}
                      </Button>

                      <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
                        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        Your details are not published on the website.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Side panel */}
            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-navy-700 bg-navy-800 p-6 text-white">
                <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white">
                  <Clock className="h-5 w-5 shrink-0 text-pink-400" aria-hidden="true" />
                  Clinic Hours
                </h2>
                <p className="mt-2 text-[1.0625rem] font-semibold text-white">
                  {settings.clinicHours}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-blue-100">
                  Evening consultations only, Monday to Saturday. The clinic team confirms each
                  request by phone or WhatsApp.
                </p>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <h3 className="text-sm font-semibold text-white">Faster alternatives</h3>
                  <div className="mt-3 space-y-2.5">
                    <a
                      href={buildPhoneHref(settings.phone)}
                      className="flex min-h-[48px] items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-pink-300" aria-hidden="true" />
                      Call {settings.phoneDisplay}
                    </a>
                    <a
                      href={buildWhatsAppHref(settings.whatsappNumber, WHATSAPP_APPOINTMENT_MESSAGE)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[48px] items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0 text-green-300" aria-hidden="true" />
                      WhatsApp {settings.whatsappDisplay}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-line bg-app p-6">
                <h2 className="text-base font-semibold text-navy-800">Before your visit</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
                  <li className="flex gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                      aria-hidden="true"
                    />
                    Bring any previous reports or referral letters you already have.
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                      aria-hidden="true"
                    />
                    Arrive a few minutes early so your consultation can start on time.
                  </li>
                  <li className="flex gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                      aria-hidden="true"
                    />
                    Contact the clinic if you need to change or cancel your appointment.
                  </li>
                </ul>

                <ButtonLink
                  to={routes.contact}
                  variant="outline"
                  size="md"
                  fullWidth
                  className="mt-5"
                >
                  Contact Details
                </ButtonLink>
              </div>

              <p className="mt-5 rounded-xl border border-line bg-white p-4 text-xs leading-relaxed text-ink-soft">
                Do not upload medical reports or share detailed medical information on this website.
                Bring documents directly to your consultation.
              </p>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}