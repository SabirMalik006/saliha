import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ImageIcon, Info, Loader2, Save, Upload, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { FormAlert } from '@/components/forms/Field';
import { Checkbox, SelectInput, TextArea, TextInput } from '@/components/forms/Inputs';
import { Seo } from '@/components/seo/Seo';
import { ErrorState } from '@/components/feedback/States';
import { SkeletonFormPanel, SkeletonRegion } from '@/components/feedback/Skeletons';
import { useAsync } from '@/hooks/useAsync';
import { adminApi } from '@/services/adminApi';
import { normaliseApiError, type ApiError } from '@/services/apiClient';
import { ACCEPTED_IMAGE_TYPES, serviceSchema, validateImageFile, type ServiceFormValues } from '@/schemas';
import { uploadsApi } from '@/services/uploadsApi';
import { useToast } from '@/context/ToastContext';
import { routes } from '@/routes/paths';
import { slugify } from '@/utils/format';

const ICON_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: 'menstrual', label: 'Menstrual health' },
  { value: 'fertility', label: 'Fertility' },
  { value: 'family-planning', label: 'Family planning' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'menopause', label: 'Menopause' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'general', label: 'General' },
  { value: 'checkup', label: 'Check-up' },
];

const EMPTY_VALUES: ServiceFormValues = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  icon: 'general',
  imageUrl: '',
  imageAlt: '',
  featured: false,
  published: false,
  displayOrder: 0,
  seoTitle: '',
  metaDescription: '',
};

export default function ServiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const existing = useAsync(
    async () => (id ? adminApi.getService(id) : null),
    [id],
  );

  const defaultValues = useMemo<ServiceFormValues>(() => {
    const service = existing.data;
    if (!service) return EMPTY_VALUES;
    return {
      title: service.title,
      slug: service.slug,
      shortDescription: service.shortDescription,
      fullDescription: service.fullDescription,
      icon: service.icon,
      imageUrl: service.imageUrl ?? '',
      imageAlt: service.imageAlt ?? '',
      featured: service.featured,
      published: service.published,
      displayOrder: service.displayOrder,
      seoTitle: service.seoTitle ?? '',
      metaDescription: service.metaDescription ?? '',
    };
  }, [existing.data]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    mode: 'onBlur',
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (existing.data) reset(defaultValues);
  }, [existing.data, defaultValues, reset]);

  // Uploads the chosen photo straight to Cloudinary and stores the URL in the form.
  const onSelectImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) {
      setUploadError(problem);
      event.target.value = '';
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await uploadsApi.image(file, {
        folder: 'services',
        onProgress: setUploadProgress,
      });
      setValue('imageUrl', uploaded.url, { shouldDirty: true, shouldValidate: true });
      toast.success('Photo uploaded', 'The service photo has been uploaded.');
    } catch (error) {
      const apiError = normaliseApiError(error);
      setUploadError(apiError.message);
      toast.error('Could not upload the photo', apiError.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const clearImage = () => {
    setValue('imageUrl', '', { shouldDirty: true, shouldValidate: true });
    setUploadError(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  // Keep the slug in step with the title until the editor types a custom one.
  const titleValue = watch('title');
  const slugValue = watch('slug');
  const imageUrlValue = watch('imageUrl') ?? '';
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched && titleValue) {
      setValue('slug', slugify(titleValue), { shouldValidate: false });
    }
  }, [setValue, slugTouched, titleValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (id) {
        await adminApi.updateService(id, {
          ...values,
          imageUrl: values.imageUrl || null,
          imageAlt: values.imageAlt || null,
          seoTitle: values.seoTitle || null,
          metaDescription: values.metaDescription || null,
        });
        toast.success('Service updated', `“${values.title}” has been saved.`);
      } else {
        await adminApi.createService({
          ...values,
          imageUrl: values.imageUrl || null,
          imageAlt: values.imageAlt || null,
          seoTitle: values.seoTitle || null,
          metaDescription: values.metaDescription || null,
        });
        toast.success('Service created', `“${values.title}” has been added.`);
      }
      navigate(routes.adminServices, { replace: true });
    } catch (error) {
      const apiError = normaliseApiError(error);
      setServerError(apiError);
      toast.error('Could not save the service', apiError.message);
    }
  });

  if (isEdit && existing.isLoading) {
    return (
      <SkeletonRegion label="Loading service details">
        <SkeletonFormPanel count={3} />
      </SkeletonRegion>
    );
  }

  if (isEdit && existing.error) {
    return (
      <ErrorState
        title="We could not load this service"
        message={existing.error.message}
        onRetry={() => void existing.refetch()}
      />
    );
  }

  const publishErrors = serverError?.fieldErrors;
  const imageError = errors.imageUrl?.message ?? publishErrors?.imageUrl;

  return (
    <>
      <Seo
          title={isEdit ? 'Edit Service | Specialist Clinic' : 'Add Service | Specialist Clinic'}
          description="Create or update a clinic service."
          path={routes.adminServices}
          noIndex
        />

      <div className="space-y-6">
        <div>
          <ButtonLink
            to={routes.adminServices}
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Back to Services
          </ButtonLink>
          <h1 className="mt-3 text-xl font-semibold text-navy-800 sm:text-2xl">
            {isEdit ? 'Edit Service' : 'Add Service'}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isEdit
              ? 'Update the content shown on the public service page.'
              : 'Create a new service. Drafts stay hidden until you publish them.'}
          </p>
        </div>

        {serverError ? (
          <FormAlert
            title={
              serverError.status === 409
                ? 'This slug is already in use'
                : 'We could not save the service'
            }
            message={serverError.message}
          />
        ) : null}

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Card padding="md">
            <h2 className="text-base font-semibold text-navy-800">Content</h2>

            <div className="mt-4 space-y-5">
              <TextInput
                label="Service title"
                required
                placeholder="e.g. Pregnancy Care"
                error={errors.title?.message ?? publishErrors?.title}
                {...register('title')}
              />

              <TextInput
                label="URL slug"
                required
                placeholder="pregnancy-care"
                hint="The address of the service page. Lowercase letters, numbers and hyphens."
                error={errors.slug?.message ?? publishErrors?.slug}
                {...register('slug', {
                  onChange: (event) => {
                    setSlugTouched(true);
                    setValue('slug', slugify(String(event.target.value)), {
                      shouldValidate: false,
                    });
                  },
                })}
              />

              <p className="text-xs text-ink-faint">
                Public address:{' '}
                <span className="font-mono">
                  /services/{slugValue || 'your-service-slug'}
                </span>
              </p>

              <TextArea
                label="Short summary"
                required
                rows={3}
                maxLength={240}
                hint="Shown on the services list page. Keep it to one or two sentences."
                error={errors.shortDescription?.message}
                {...register('shortDescription')}
              />

              <TextArea
                label="Full description"
                required
                rows={10}
                hint="The main body of the service page. Use plain paragraphs; avoid headings or marketing claims."
                error={errors.fullDescription?.message}
                {...register('fullDescription')}
              />

              <SelectInput
                label="Icon"
                options={ICON_OPTIONS}
                hint="Used on the services cards and at the top of the service page."
                error={errors.icon?.message}
                {...register('icon')}
              />

              <div>
                <span className="block text-sm font-semibold text-navy-800">Service photo</span>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  Optional. Upload a JPG, PNG, WebP or AVIF up to 5 MB. Without a photo the card
                  shows the icon tile instead.
                </p>

                <input
                  ref={imageInputRef}
                  id="service-image"
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  onChange={(event) => void onSelectImage(event)}
                  className="sr-only"
                />
                {/* Keeps the uploaded URL inside react-hook-form for validation + submit. */}
                <input type="hidden" {...register('imageUrl')} />

                <div className="mt-3 overflow-hidden rounded-xl border border-line bg-app">
                  {imageUrlValue ? (
                    <img
                      src={imageUrlValue}
                      alt="Preview of the service photo"
                      className="aspect-[16/10] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 text-ink-faint">
                      <ImageIcon className="h-8 w-8" aria-hidden="true" />
                      <p className="text-sm">No photo uploaded</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    leftIcon={
                      isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Upload className="h-4 w-4" aria-hidden="true" />
                      )
                    }
                  >
                    {isUploading
                      ? `Uploading… ${uploadProgress}%`
                      : imageUrlValue
                        ? 'Replace photo'
                        : 'Upload photo'}
                  </Button>

                  {imageUrlValue && !isUploading ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearImage}
                      leftIcon={<X className="h-4 w-4" aria-hidden="true" />}
                    >
                      Remove photo
                    </Button>
                  ) : null}
                </div>

                {uploadError ? (
                  <p
                    role="alert"
                    className="mt-3 flex items-start gap-2 rounded-lg border border-pink-200 bg-pink-50 p-3 text-sm text-pink-700"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {uploadError}
                  </p>
                ) : null}

                {imageError ? <p className="mt-2 text-sm text-pink-700">{imageError}</p> : null}
              </div>

              <TextInput
                label="Image alt text"
                placeholder="e.g. Clinic reception desk"
                hint="Describe the image for screen readers. Leave empty if there is no image."
                error={errors.imageAlt?.message}
                {...register('imageAlt')}
              />
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-base font-semibold text-navy-800">Visibility</h2>

            <div className="mt-4 space-y-5">
              <TextInput
                label="Display order"
                type="number"
                min={0}
                max={9999}
                hint="Lower numbers appear first. Use 0 to keep it at the top."
                error={errors.displayOrder?.message}
                {...register('displayOrder')}
              />

              <Checkbox
                label="Published"
                hint="Published services appear on the public website."
                error={errors.published?.message}
                {...register('published')}
              />

              <Checkbox
                label="Featured"
                hint="Featured services are highlighted on the home page."
                error={errors.featured?.message}
                {...register('featured')}
              />
            </div>
          </Card>

          <details className="group rounded-2xl border border-line bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-navy-800">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" aria-hidden="true" />
                SEO overrides (optional)
              </span>
              <span className="text-sm font-normal text-ink-soft group-open:hidden">Show</span>
              <span className="hidden text-sm font-normal text-ink-soft group-open:inline">Hide</span>
            </summary>

            <div className="mt-4 space-y-5">
              <TextInput
                label="SEO title"
                maxLength={70}
                placeholder="Defaults to the service title"
                error={errors.seoTitle?.message}
                {...register('seoTitle')}
              />

              <TextArea
                label="Meta description"
                rows={3}
                maxLength={180}
                placeholder="Defaults to the short summary"
                error={errors.metaDescription?.message}
                {...register('metaDescription')}
              />
            </div>
          </details>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ButtonLink to={routes.adminServices} variant="outline" size="lg">
              Cancel
            </ButtonLink>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              leftIcon={!isSubmitting ? <Save className="h-4 w-4" aria-hidden="true" /> : undefined}
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Service'}
            </Button>
          </div>

          {isDirty && !isSubmitting ? (
            <p className="text-right text-xs text-ink-faint">You have unsaved changes.</p>
          ) : null}
        </form>
      </div>
    </>
  );
}

