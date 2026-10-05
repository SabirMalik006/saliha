import { useState, type ReactNode } from 'react';
import { ImageOff } from 'lucide-react';
import { ClinicLogo } from '@/components/brand/ClinicLogo';
import { cn } from '@/utils/cn';

export interface SmartImageProps {
  src: string | null | undefined;
  /** Always required. If empty, a neutral placeholder is rendered instead. */
  alt: string;
  className?: string;
  wrapperClassName?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  /** Ratio keeps the box reserved while loading — prevents layout shift. */
  aspectRatio?: string;
  /** Slightly smaller placeholder label for tight spaces. */
  compact?: boolean;
  rounded?: 'none' | 'md' | 'lg' | 'xl' | 'full';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Image with a graceful fallback.
 *
 * Guarantees:
 *   - reserved box (no layout shift) via aspect-ratio
 *   - a designed placeholder when the source is missing or fails
 *   - meaningful alt text, or an empty-string alt for decorative images
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  width,
  height,
  loading = 'lazy',
  aspectRatio = '4 / 3',
  compact = false,
  rounded = 'lg',
  fetchPriority = 'auto',
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const isDecorative = alt.trim() === '';
  const showPlaceholder = !src || failed;

  const radii = {
    none: '',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  } as const;

  return (
    <span
      className={cn(
        'relative block overflow-hidden bg-app',
        radii[rounded],
        wrapperClassName,
      )}
      style={{ aspectRatio }}
    >
      {showPlaceholder ? (
        <span
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 via-app to-pink-50 px-4 text-center',
            compact && 'gap-1',
          )}
        >
          <ImageOff
            className={cn('shrink-0 text-blue-300', compact ? 'h-5 w-5' : 'h-8 w-8')}
            aria-hidden="true"
          />
          {!compact ? (
            <span className="max-w-[22ch] text-[0.6875rem] font-medium leading-snug text-ink-faint">
              Image awaiting clinic approval
            </span>
          ) : null}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          aria-hidden={isDecorative || undefined}
          role={isDecorative ? 'presentation' : undefined}
          onError={() => setFailed(true)}
          className={cn(
            'h-full w-full object-cover',
            radii[rounded],
            className,
          )}
        />
      )}
    </span>
  );
}

/** Avatar initials — used in the admin top bar. */
export function InitialAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const label = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-700',
        size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm',
      )}
    >
      {label}
    </span>
  );
}

/**
 * Illustration slot for the doctor's approved portrait.
 *
 * Spec AC-10 forbids placeholder copy remaining at launch, and CONF-06 allows
 * neutral imagery until an approved photograph exists. Until then this renders a
 * clean branded panel instead of a "photo coming soon" caption, so no
 * unfinished-looking text is ever shown to a patient.
 */
export function PortraitSlot({
  imageUrl,
  imageAlt,
  className,
  caption,
}: {
  imageUrl: string | null;
  imageAlt: string | null;
  className?: string;
  caption?: ReactNode;
}) {
  const hasImage = Boolean(imageUrl);

  return (
    <figure className={cn('relative', className)}>
      {hasImage ? (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-blue-50 via-white to-pink-50 shadow-md">
          <SmartImage
            src={imageUrl}
            alt={imageAlt ?? 'Approved portrait of Dr. Saleha Ibtisam'}
            aspectRatio="4 / 5"
            rounded="none"
            wrapperClassName="w-full"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      ) : (
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-navy-800 via-blue-900 to-pink-900 p-8 shadow-md">
          <div aria-hidden="true" className="absolute inset-0 opacity-25">
            <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-blue-400/40 blur-2xl" />
            <div className="absolute -right-8 bottom-10 h-44 w-44 rounded-full bg-pink-400/40 blur-2xl" />
          </div>
          <div className="relative text-center">
            <ClinicLogo size="md" className="mx-auto h-20 w-20" title="" />
            <p className="mt-5 text-lg font-bold text-white">Dr. Saleha Ibtisam</p>
            <p className="mt-1.5 text-sm leading-snug text-blue-100">
              Consultant Gynecologist &amp; Obstetrician
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-pink-200">
              MBBS &middot; FCPS
            </p>
          </div>
        </div>
      )}
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-ink-soft">{caption}</figcaption>
      ) : null}
    </figure>
  );
}