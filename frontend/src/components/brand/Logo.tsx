import { cn } from '@/utils/cn';
import { ClinicLogo, type ClinicLogoSize } from '@/components/brand/ClinicLogo';

export interface LogoMarkProps {
  className?: string;
  /** Accessible label. Pass an empty string when adjacent text already names it. */
  title?: string;
}

/** Circular clinic mark, matching `/favicon.svg`. */
export function LogoMark({ className, title = 'Specialist Clinic' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('h-10 w-10 shrink-0', className)}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
    >
      <title>{title || undefined}</title>
      <circle cx="32" cy="32" r="32" fill="#102D55" />
      <path d="M32 12a20 20 0 0 1 0 40" fill="#2456A6" />
      <path d="M32 52A20 20 0 0 1 32 12" fill="#E83E8C" opacity="0.92" />
      <circle cx="32" cy="32" r="14.5" fill="#FFFFFF" />
      <path
        d="M29.4 22.5h5.2v6.9h6.9v5.2h-6.9v6.9h-5.2v-6.9h-6.9v-5.2h6.9z"
        fill="#E83E8C"
      />
    </svg>
  );
}

export interface LogoProps {
  /** `stacked` for the footer / hero lockups, `inline` for the header. */
  variant?: 'inline' | 'stacked';
  tone?: 'light' | 'dark';
  clinicName?: string;
  doctorName?: string;
  className?: string;
  /** Hide the sub-label on narrow headers. */
  compact?: boolean;
  /**
   * Renders the clinic's own artwork by default. Pass `svg` to force the
   * generated square mark instead.
   */
  mark?: 'image' | 'svg';
  /** Which pre-generated derivative of the artwork to load. */
  logoSize?: ClinicLogoSize;
}

export function Logo({
  variant = 'inline',
  tone = 'light',
  clinicName = 'Specialist Clinic',
  doctorName = 'Dr. Saleha Ibtisam',
  className,
  compact = false,
  mark = 'image',
  logoSize = variant === 'stacked' ? 'lg' : 'sm',
}: LogoProps) {
  const isDark = tone === 'dark';
  const boxClass = variant === 'stacked' ? 'h-16 w-16' : 'h-11 w-11 sm:h-12 sm:w-12';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-3',
        variant === 'stacked' && 'flex-col gap-3 text-center',
        className,
      )}
    >
      {mark === 'image' ? (
        <ClinicLogo size={logoSize} className={boxClass} title="" />
      ) : (
        <LogoMark className={boxClass} title="" />
      )}

      <span className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            'font-bold tracking-[-0.01em]',
            variant === 'stacked' ? 'text-xl' : 'text-[1.0625rem] sm:text-lg',
            isDark ? 'text-white' : 'text-navy-800',
          )}
        >
          {clinicName}
        </span>
        {!compact ? (
          <span
            className={cn(
              'truncate text-xs sm:text-[0.8125rem]',
              isDark ? 'text-blue-200' : 'text-ink-soft',
            )}
          >
            {doctorName}
          </span>
        ) : null}
      </span>
    </span>
  );
}