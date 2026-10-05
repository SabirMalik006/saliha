import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Plus, Save, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { FormAlert } from '@/components/forms/Field';
import { TextArea, TextInput } from '@/components/forms/Inputs';
import { Seo } from '@/components/seo/Seo';
import { ErrorState, SkeletonCard } from '@/components/feedback/States';
import { useAsync } from '@/hooks/useAsync';
import { adminApi } from '@/services/adminApi';
import { normaliseApiError, type ApiError } from '@/services/apiClient';
import { settingsSchema, type SettingsFormValues } from '@/schemas';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/context/ToastContext';
import { routes } from '@/routes/paths';
import type { ClinicSettings } from '@/types';

const MAX_QUALIFICATIONS = 10;

function toFormValues(settings: ClinicSettings): SettingsFormValues {
  return {
    clinicName: settings.clinicName,
    doctorName: settings.doctorName,
    doctorDesignation: settings.doctorDesignation,
    doctorQualifications: settings.doctorQualifications.length
      ? [...settings.doctorQualifications]
      : [''],
    carePhilosophy: settings.carePhilosophy,
    addressLine: settings.addressLine,
    addressLandmark: settings.addressLandmark,
    addressCity: settings.addressCity,
    clinicHours: settings.clinicHours,
    phone: settings.phone,
    phoneDisplay: settings.phoneDisplay,
    // Nullable API fields are normalised to '' for the form inputs.
    alternatePhone: settings.alternatePhone ?? '',
    alternatePhoneDisplay: settings.alternatePhoneDisplay ?? '',
    whatsappNumber: settings.whatsappNumber,
    whatsappDisplay: settings.whatsappDisplay,
    notificationEmail: settings.notificationEmail ?? '',
    mapUrl: settings.mapUrl ?? '',
    social: { ...settings.social },
    siteUrl: settings.siteUrl ?? '',
  };
}

export default function SiteSettingsPage() {
  const toast = useToast();
  const { reload } = useSettings();
  const [serverError, setServerError] = useState<ApiError | null>(null);

  const settings = useAsync(() => adminApi.getSettings(), []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    mode: 'onBlur',
    defaultValues: {
      clinicName: '',
      doctorName: '',
      doctorDesignation: '',
      doctorQualifications: [''],
      carePhilosophy: '',
      addressLine: '',
      addressLandmark: '',
      addressCity: '',
      clinicHours: '',
      phone: '',
      phoneDisplay: '',
      alternatePhone: '',
      alternatePhoneDisplay: '',
      whatsappNumber: '',
      whatsappDisplay: '',
      notificationEmail: '',
      mapUrl: '',
      social: { facebook: '', instagram: '', linkedin: '' },
      siteUrl: '',
    },
  });

  useEffect(() => {
    if (settings.data) reset(toFormValues(settings.data));
  }, [settings.data, reset]);

  const qualifications = watch('doctorQualifications');

  const addQualification = () => {
    if (qualifications.length >= MAX_QUALIFICATIONS) return;
    setValue('doctorQualifications', [...qualifications, ''], { shouldDirty: true });
  };

  const removeQualification = (index: number) => {
    const next = qualifications.filter((_, position) => position !== index);
    setValue('doctorQualifications', next.length ? next : [''], { shouldDirty: true });
  };

  const updateQualification = (index: number, value: string) => {
    const next = [...qualifications];
    next[index] = value;
    setValue('doctorQualifications', next, { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      // The API stores optional fields as null; the form represents them as ''.
      const payload: Partial<ClinicSettings> = {
        ...values,
        alternatePhone: values.alternatePhone,
        alternatePhoneDisplay: values.alternatePhoneDisplay,
        notificationEmail: values.notificationEmail || null,
        mapUrl: values.mapUrl || null,
        siteUrl: values.siteUrl || '',
      };

      await adminApi.updateSettings(payload);
      await reload();
      toast.success('Settings saved', 'The clinic details have been updated.');
      // Re-sync from the server response rather than trusting local state.
      reset({
        ...values,
        doctorQualifications: values.doctorQualifications.length
          ? values.doctorQualifications
          : [''],
      });
    } catch (error) {
      const apiError = normaliseApiError(error);
      setServerError(apiError);
      toast.error('Could not save the settings', apiError.message);
    }
  });

  if (settings.isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (settings.error) {
    return (
      <ErrorState
        title="We could not load the settings"
        message={settings.error.message}
        onRetry={() => void settings.refetch()}
      />
    );
  }

  const socialErrors = errors.social;

  return (
    <>
      <Seo
        title="Site Settings | Specialist Clinic"
        description="Manage clinic contact details and page content."
        path={routes.adminSettings}
        noIndex
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-navy-800 sm:text-2xl">Site Settings</h1>
          <p className="mt-1 text-sm text-ink-soft">
            These values appear across the public website. Changes take effect immediately.
          </p>
        </div>

        {serverError ? (
          <FormAlert title="We could not save the settings" message={serverError.message} />
        ) : null}

        <p className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Only publish qualifications and affiliations that have been confirmed in writing by the
            clinic. Leave a field empty to hide it from the public website.
          </span>
        </p>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Card padding="md">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-semibold text-navy-800">Clinic identity</h2>
            </div>

            <div className="mt-4 space-y-5">
              <TextInput
                label="Clinic name"
                required
                error={errors.clinicName?.message}
                {...register('clinicName')}
              />

              <TextInput
                label="Doctor name"
                required
                error={errors.doctorName?.message}
                {...register('doctorName')}
              />

              <TextInput
                label="Designation"
                required
                hint="Shown beneath the doctor's name, e.g. Consultant Gynecologist & Obstetrician."
                error={errors.doctorDesignation?.message}
                {...register('doctorDesignation')}
              />

              <TextArea
                label="Care philosophy"
                rows={3}
                hint="A short statement about the approach to patient care."
                error={errors.carePhilosophy?.message}
                {...register('carePhilosophy')}
              />

              {/* Repeatable qualifications */}
              <fieldset>
                <legend className="text-sm font-semibold text-navy-800">
                  Qualifications
                </legend>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Only list qualifications that have been confirmed. Leave every row empty to hide
                  qualifications from the website.
                </p>

                <div className="mt-3 space-y-3">
                  {qualifications.map((value, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <label htmlFor={`qualification-${index}`} className="sr-only">
                          Qualification {index + 1}
                        </label>
                        <input
                          id={`qualification-${index}`}
                          type="text"
                          value={value}
                          placeholder="e.g. MBBS"
                          maxLength={40}
                          onChange={(event) => updateQualification(index, event.target.value)}
                          aria-invalid={
                            errors.doctorQualifications ? Boolean(errors.doctorQualifications) : undefined
                          }
                          className="min-h-[48px] w-full rounded-xl border border-line bg-white px-3.5 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink-faint hover:border-ink-faint focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100"
                        />
                      </div>

                      {qualifications.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-1.5 text-red-600 hover:bg-red-50"
                          onClick={() => removeQualification(index)}
                          leftIcon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                          aria-label={`Remove qualification ${index + 1}`}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {qualifications.length < MAX_QUALIFICATIONS ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={addQualification}
                    leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
                  >
                    Add another qualification
                  </Button>
                ) : null}

                {errors.doctorQualifications ? (
                  <p role="alert" className="mt-2 text-sm text-pink-600">
                    {errors.doctorQualifications.message}
                  </p>
                ) : null}
              </fieldset>
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-base font-semibold text-navy-800">Contact details</h2>

            <div className="mt-4 space-y-5">
              <TextInput
                label="Primary phone"
                required
                type="tel"
                inputMode="numeric"
                placeholder="0515431070"
                hint="Digits only. Local (0515431070) or international (+92 51 5431070) are both accepted."
                error={errors.phone?.message}
                {...register('phone')}
              />

              <TextInput
                label="Primary phone (display)"
                required
                placeholder="051-5431070"
                hint="Exactly how the number is shown on the website."
                error={errors.phoneDisplay?.message}
                {...register('phoneDisplay')}
              />

              <TextInput
                label="WhatsApp number (digits with country code)"
                required
                type="tel"
                inputMode="numeric"
                placeholder="923310000643"
                hint="Country code is required here because wa.me links use international format."
                error={errors.whatsappNumber?.message}
                {...register('whatsappNumber')}
              />

              <TextInput
                label="WhatsApp number (display)"
                required
                placeholder="0331-0000643"
                error={errors.whatsappDisplay?.message}
                {...register('whatsappDisplay')}
              />

              <TextInput
                label="Alternate phone"
                type="tel"
                inputMode="numeric"
                hint="Optional. Leave empty to hide it."
                error={errors.alternatePhone?.message}
                {...register('alternatePhone')}
              />

              <TextInput
                label="Alternate phone (display)"
                placeholder="0334-8676501"
                error={errors.alternatePhoneDisplay?.message}
                {...register('alternatePhoneDisplay')}
              />

              <TextInput
                label="Notification email"
                type="email"
                placeholder="clinic@example.com"
                hint="Optional. Where form submissions are notified."
                error={errors.notificationEmail?.message}
                {...register('notificationEmail')}
              />

              <TextInput
                label="Clinic hours"
                required
                placeholder="6:00 PM – 9:00 PM"
                error={errors.clinicHours?.message}
                {...register('clinicHours')}
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-base font-semibold text-navy-800">Address and location</h2>

            <div className="mt-4 space-y-5">
              <TextInput
                label="Address"
                required
                error={errors.addressLine?.message}
                {...register('addressLine')}
              />

              <TextInput
                label="Nearby landmark"
                placeholder="Near Citilab Morgah"
                hint="Optional. Helps visitors find the clinic."
                error={errors.addressLandmark?.message}
                {...register('addressLandmark')}
              />

              <TextInput
                label="City"
                required
                error={errors.addressCity?.message}
                {...register('addressCity')}
              />

              <TextInput
                label="Google Maps link"
                type="url"
                placeholder="https://maps.app.goo.gl/…"
                hint="Optional. Until this is set, the contact page shows a written address instead of an embedded map."
                error={errors.mapUrl?.message}
                {...register('mapUrl')}
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-base font-semibold text-navy-800">Social and technical</h2>

            <div className="mt-4 space-y-5">
              <TextInput
                label="Facebook URL"
                type="url"
                placeholder="https://facebook.com/…"
                error={socialErrors?.facebook?.message}
                {...register('social.facebook')}
              />

              <TextInput
                label="Instagram URL"
                type="url"
                placeholder="https://instagram.com/…"
                error={socialErrors?.instagram?.message}
                {...register('social.instagram')}
              />

              <TextInput
                label="LinkedIn URL"
                type="url"
                placeholder="https://linkedin.com/company/…"
                error={socialErrors?.linkedin?.message}
                {...register('social.linkedin')}
              />

              <TextInput
                label="Website URL"
                type="url"
                placeholder="https://…"
                hint="Optional. Used for canonical URLs and the sitemap."
                error={errors.siteUrl?.message}
                {...register('siteUrl')}
              />
            </div>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting || !isDirty}
              onClick={() => settings.data && reset(toFormValues(settings.data))}
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              leftIcon={!isSubmitting ? <Save className="h-4 w-4" aria-hidden="true" /> : undefined}
            >
              {isSubmitting ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}