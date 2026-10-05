import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ImageIcon, Save, Upload, X } from 'lucide-react';
import { Button, ButtonLink } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { FormAlert } from '@/components/forms/Field';
import { Checkbox, SelectInput, TextArea, TextInput } from '@/components/forms/Inputs';
import { Seo } from '@/components/seo/Seo';
import { ErrorState, SkeletonCard } from '@/components/feedback/States';
import { useAsync } from '@/hooks/useAsync';
import { adminApi } from '@/services/adminApi';
import { normaliseApiError, type ApiError } from '@/services/apiClient';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  gallerySchema,
  validateImageFile,
  type GalleryFormValues,
} from '@/schemas';
import { useToast } from '@/context/ToastContext';
import { routes } from '@/routes/paths';
import { GALLERY_CATEGORIES, type GalleryCategory } from '@/types';

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  clinic: 'Clinic',
  awareness: 'Awareness',
  events: 'Events',
  promotional: 'Promotional',
};

const CATEGORY_OPTIONS = GALLERY_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

const EMPTY_VALUES: GalleryFormValues = {
  title: '',
  caption: '',
  altText: '',
  category: 'clinic',
  imageUrl: '',
  displayOrder: 0,
  published: false,
};

export default function GalleryFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const existing = useAsync(async () => (id ? adminApi.getGalleryItem(id) : null), [id]);

  const existingPreview = existing.data?.imageUrl ?? null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GalleryFormValues>({
    resolver: zodResolver(gallerySchema),
    mode: 'onBlur',
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    const item = existing.data;
    if (!item) return;
    reset({
      title: item.title,
      caption: item.caption ?? '',
      altText: item.altText,
      category: item.category,
      imageUrl: '',
      displayOrder: item.displayOrder,
      published: item.published,
    });
  }, [existing.data, reset]);

  // Release the temporary preview URL when it is replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const onSelectFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const problem = validateImageFile(selected);
    if (problem) {
      setFileError(problem);
      setFile(null);
      return;
    }

    setFileError(null);
    setFile(selected);
    setFilePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(selected);
    });
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setFileError(null);
    setFilePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    if (isEdit && !file) {
      // Editing metadata only - no multipart body needed.
      try {
        await adminApi.updateGalleryItem(id as string, {
          title: values.title,
          caption: values.caption,
          altText: values.altText,
          category: values.category,
          displayOrder: values.displayOrder,
          published: values.published,
        });
        toast.success('Image updated', `“${values.title}” has been saved.`);
        navigate(routes.adminGallery, { replace: true });
      } catch (error) {
        const apiError = normaliseApiError(error);
        setServerError(apiError);
        toast.error('Could not save the image', apiError.message);
      }
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('caption', values.caption);
    formData.append('altText', values.altText);
    formData.append('category', values.category);
    formData.append('displayOrder', String(values.displayOrder));
    formData.append('published', String(values.published));
    if (file) formData.append('image', file);

    try {
      if (isEdit) {
        await adminApi.updateGalleryItem(id as string, formData);
        toast.success('Image updated', `“${values.title}” has been saved.`);
      } else {
        await adminApi.createGalleryItem(formData);
        toast.success('Image added', `“${values.title}” has been added to the gallery.`);
      }
      navigate(routes.adminGallery, { replace: true });
    } catch (error) {
      const apiError = normaliseApiError(error);
      setServerError(apiError);
      toast.error('Could not save the image', apiError.message);
    }
  });

  if (isEdit && existing.isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isEdit && existing.error) {
    return (
      <ErrorState
        title="We could not load this image"
        message={existing.error.message}
        onRetry={() => void existing.refetch()}
      />
    );
  }

  const previewSrc = filePreview ?? existingPreview;
  const publishErrors = serverError?.fieldErrors;

  return (
    <>
      <Seo
        title={isEdit ? 'Edit Image | Specialist Clinic' : 'Add Image | Specialist Clinic'}
        description="Create or update a gallery image."
        path={routes.adminGallery}
        noIndex
      />

      <div className="space-y-6">
        <div>
          <ButtonLink
            to={routes.adminGallery}
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Back to Gallery
          </ButtonLink>
          <h1 className="mt-3 text-xl font-semibold text-navy-800 sm:text-2xl">
            {isEdit ? 'Edit Image' : 'Add Image'}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isEdit
              ? 'Update the caption, alt text or visibility of this image.'
              : 'Upload a clinic image and describe it for screen-reader users.'}
          </p>
        </div>

        {serverError ? (
          <FormAlert
            title="We could not save the image"
            message={serverError.message}
          />
        ) : null}

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Card padding="md">
            <h2 className="text-base font-semibold text-navy-800">Image file</h2>

            <div className="mt-4 space-y-4">
              {/* Preview */}
              <div className="overflow-hidden rounded-xl border border-line bg-app">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Preview of the image being uploaded"
                    className="aspect-4/3 w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-4/3 w-full flex-col items-center justify-center gap-2 text-ink-faint">
                    <ImageIcon className="h-8 w-8" aria-hidden="true" />
                    <p className="text-sm">No image selected</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                id="gallery-image"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={onSelectFile}
                className="sr-only"
                aria-describedby="gallery-image-hint"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="h-4 w-4" aria-hidden="true" />}
                >
                  {file || existingPreview ? 'Choose a different image' : 'Choose image'}
                </Button>

                {file ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFile}
                    leftIcon={<X className="h-4 w-4" aria-hidden="true" />}
                  >
                    Remove selected image
                  </Button>
                ) : null}
              </div>

              <p id="gallery-image-hint" className="text-xs leading-relaxed text-ink-soft">
                JPG, PNG, WebP or AVIF, up to {Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB.
                {isEdit && !file
                  ? ' Leave the current file as-is to keep the existing image.'
                  : ' An image file is required.'}
              </p>

              {fileError ? (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-pink-200 bg-pink-50 p-3 text-sm text-pink-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {fileError}
                </p>
              ) : null}
            </div>
          </Card>

          <Card padding="md">
            <h2 className="text-base font-semibold text-navy-800">Details</h2>

            <div className="mt-4 space-y-5">
              <TextInput
                label="Title"
                required
                placeholder="e.g. Clinic waiting area"
                hint="Internal label for this image. Not shown publicly."
                error={errors.title?.message ?? publishErrors?.title}
                {...register('title')}
              />

              <TextArea
                label="Caption"
                rows={3}
                maxLength={300}
                placeholder="Short description shown beneath the image"
                error={errors.caption?.message}
                {...register('caption')}
              />

              <TextInput
                label="Alt text"
                required
                placeholder="e.g. Bright clinic waiting area with seating for patients"
                hint="Describe what is in the image for people using a screen reader."
                error={errors.altText?.message}
                {...register('altText')}
              />

              <SelectInput
                label="Category"
                options={CATEGORY_OPTIONS}
                error={errors.category?.message}
                {...register('category')}
              />

              <TextInput
                label="Display order"
                type="number"
                min={0}
                max={9999}
                hint="Lower numbers appear first in the gallery."
                error={errors.displayOrder?.message}
                {...register('displayOrder')}
              />

              <Checkbox
                label="Published"
                hint="Published images appear in the public gallery."
                error={errors.published?.message}
                {...register('published')}
              />
            </div>
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ButtonLink to={routes.adminGallery} variant="outline" size="lg">
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
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Image'}
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