import { cn } from '@/utils/cn';

/**
 * Clinic brand imagery.
 *
 * `CLINIC_LOGO_SOURCES` points at the logo artwork supplied by the clinic
 * (`public/images/logo/`). Derived sizes were generated from the 1254x1254
 * original so no page downloads the full-size file.
 *
 * The square `LogoMark` SVG in `./Logo.tsx` remains the fallback: if the raster
 * asset is ever removed, the site still renders a complete brand mark instead of
 * a broken image.
 */
export const CLINIC_LOGO_SOURCES = {
  /** Small: header lockups, favicons. */
  sm: '/images/logo/clinic-logo-128.jpg',
  /** Default: most placements. */
  md: '/images/logo/clinic-logo-256.jpg',
  /** High-density displays, hero and footer lockups. */
  lg: '/images/logo/clinic-logo-512.jpg',
  /** Untouched original, kept for print/press use. Never rendered on-page. */
  original: '/images/logo/clinic-logo-original.jpg',
} as const;

export type ClinicLogoSize = keyof typeof CLINIC_LOGO_SOURCES;

/** Pixel dimensions of each derivative, used to prevent layout shift. */
const LOGO_INTRINSIC: Record<ClinicLogoSize, number> = {
  sm: 128,
  md: 256,
  lg: 512,
  original: 1254,
};

export interface ClinicLogoProps {
  size?: ClinicLogoSize;
  className?: string;
  /** Pass an empty string when adjacent text already names the clinic. */
  title?: string;
}

/**
 * The clinic's own logo artwork, square by design, so it must be rendered in a
 * square box or the mark will distort.
 */
export function ClinicLogo({
  size = 'md',
  className,
  title = 'Specialist Clinic',
}: ClinicLogoProps) {
  return (
    <img
      src={CLINIC_LOGO_SOURCES[size]}
      alt={title}
      aria-hidden={title ? undefined : true}
      width={LOGO_INTRINSIC[size]}
      height={LOGO_INTRINSIC[size]}
      className={cn('shrink-0 object-contain', className)}
      // The logo sits above the fold in the header and hero.
      fetchPriority="high"
      decoding="async"
    />
  );
}