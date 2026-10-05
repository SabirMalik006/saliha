/**
 * Skeleton placeholders.
 *
 * Rules these follow:
 *  - Every skeleton mirrors the real component's box model, so content
 *    arriving causes no layout shift (spec §15).
 *  - Never shown to screen readers as content; the wrapping region carries
 *    `role="status"` and a label instead.
 *  - Shimmer is disabled automatically for `prefers-reduced-motion`.
 *
 * Prefer these over a bare spinner whenever the shape of the pending content
 * is known, because a spinner hides what is coming.
 */

import { cn } from '@/utils/cn';

/* ==========================================================================
   Primitives
   ========================================================================== */

export function Skeleton({
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} aria-hidden="true" {...rest} />;
}

/** One line of body copy. */
export function SkeletonText({
  lines = 3,
  className,
  /** Last line is shortened, as in real paragraphs. */
  ragged = true,
}: {
  lines?: number;
  className?: string;
  ragged?: boolean;
}) {
  return (
    <div className={cn('space-y-2.5', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5 w-full', ragged && index === lines - 1 && 'w-4/6')}
        />
      ))}
    </div>
  );
}

/** Small pill placeholder, used for tags and badges. */
export function SkeletonPill({ className }: { className?: string }) {
  return <Skeleton className={cn('h-6 w-16 rounded-full', className)} />;
}

/* ==========================================================================
   Page chrome
   ========================================================================== */

/** Standalone loading region with an accessible label. */
export function SkeletonRegion({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" aria-label={label} className={className}>
      {children}
    </div>
  );
}

/** Breadcrumb bar shown above a page title while the page loads. */
export function SkeletonBreadcrumbs() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <Skeleton className="h-3.5 w-12" />
      <Skeleton className="h-3.5 w-3" />
      <Skeleton className="h-3.5 w-20" />
    </div>
  );
}

/** Page hero: eyebrow, heading, intro paragraph and two buttons. */
export function SkeletonPageHero({ className }: { className?: string }) {
  return (
    <div className={cn('max-w-3xl', className)} aria-hidden="true">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-9 w-4/5 sm:h-11" />
      <Skeleton className="mt-2 h-9 w-3/5 sm:h-11" />
      <div className="mt-6">
        <SkeletonText lines={3} />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-[52px] w-full rounded-xl sm:w-52" />
        <Skeleton className="h-[52px] w-full rounded-xl sm:w-48" />
      </div>
    </div>
  );
}

/**
 * Generic page body used by the route-level Suspense fallbacks.
 *
 * Shaped like a standard interior page: gradient hero, then a content grid.
 * Any real page that resolves within the same tick replaces it without a jump.
 */
export function SkeletonPageBody() {
  return (
    <>
      <div className="border-b border-line bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <SkeletonBreadcrumbs />
          <div className="mt-8">
            <SkeletonPageHero />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <SkeletonSectionHeading centered={false} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonServiceCard key={index} />
          ))}
        </div>
      </div>
    </>
  );
}

/** Section heading used by most marketing sections. */
export function SkeletonSectionHeading({
  centered = true,
  className,
}: {
  centered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-col gap-4', centered && 'items-center text-center', className)}
      aria-hidden="true"
    >
      <div className={cn('max-w-2xl', centered && 'w-full')}>
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="mt-4 h-8 w-3/4 sm:h-10" />
        <div className="mt-4 flex flex-col gap-2.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
      </div>
      <Skeleton className="h-11 w-40 rounded-xl" />
    </div>
  );
}

/* ==========================================================================
   Home page
   ========================================================================== */

/** The four "at a glance" fact cards under the hero. */
export function SkeletonTrustStrip({ className }: { className?: string }) {
  return (
    <ul
      className={cn('grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4', className)}
      aria-hidden="true"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <li
          key={index}
          className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white p-5 text-center shadow-sm sm:p-6"
        >
          <Skeleton className="skeleton-circle h-12 w-12" />
          <Skeleton className="mt-3.5 h-2.5 w-20" />
          <Skeleton className="mt-2 h-3.5 w-3/4" />
        </li>
      ))}
    </ul>
  );
}

/** Hero text column and the doctor card beside it. */
export function SkeletonHero({ className }: { className?: string }) {
  return (
    <div className={cn('grid items-center gap-10 lg:grid-cols-12 lg:gap-14', className)} aria-hidden="true">
      <div className="lg:col-span-6">
        <Skeleton className="h-7 w-72 rounded-full" />
        <Skeleton className="mt-5 h-10 w-full" />
        <Skeleton className="mt-2 h-10 w-4/5" />
        <div className="mt-5">
          <SkeletonText lines={3} />
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-[52px] w-full rounded-xl sm:w-48" />
          <Skeleton className="h-[52px] w-full rounded-xl sm:w-56" />
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-[74px] rounded-xl" />
          <Skeleton className="h-[74px] rounded-xl" />
        </div>
      </div>

      <div className="lg:col-span-6">
        <div className="mx-auto max-w-md overflow-hidden rounded-[2rem] border border-line bg-white shadow-xl">
          <Skeleton className="h-[360px] w-full rounded-none sm:h-[400px] lg:h-[410px]" />
          <div className="space-y-3 border-t border-line/70 bg-white px-6 py-5 text-center">
            <Skeleton className="mx-auto h-2.5 w-64" />
            <Skeleton className="mx-auto h-6 w-48" />
            <div className="flex justify-center gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Services
   ========================================================================== */

/** Mirrors `ServiceCard`, including the icon box and "View Details" line. */
export function SkeletonServiceCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="mt-4 h-4 w-4/5" />
      <div className="mt-3 flex-1">
        <SkeletonText lines={3} />
      </div>
      <Skeleton className="mt-5 h-4 w-28" />
    </div>
  );
}

/**
 * Service card grid.
 *
 * `columns` must match the grid the real content will use, otherwise the
 * layout shifts when data arrives.
 */
export function SkeletonServiceGrid({
  count = 8,
  columns = 4,
  className,
}: {
  count?: number;
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-5',
        columns === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonServiceCard key={index} />
      ))}
    </div>
  );
}

/* ==========================================================================
   Gallery
   ========================================================================== */

/** Mirrors a gallery tile, including its category chip and caption lines. */
export function SkeletonGalleryTile({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <span className="flex flex-1 flex-col p-3.5 sm:p-4">
        <SkeletonPill className="h-[18px] w-[70px]" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <Skeleton className="mt-2 h-3 w-full" />
      </span>
    </div>
  );
}

export function SkeletonGalleryGrid({
  count = 6,
  /** Must match the real grid, or the layout jumps when images arrive. */
  preview = false,
  className,
}: {
  count?: number;
  preview?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'grid gap-4 sm:gap-5',
        preview
          ? 'grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <SkeletonGalleryTile />
        </li>
      ))}
    </ul>
  );
}

/* ==========================================================================
   Service detail
   ========================================================================== */

/** Full service detail page: hero, body copy and a related-services row. */
export function SkeletonServiceDetail({ className }: { className?: string }) {
  return (
    <div className={cn('py-12 sm:py-16', className)}>
      <SkeletonBreadcrumbs />
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="mt-6 h-4 w-32" />
          <Skeleton className="mt-3 h-10 w-full" />
          <Skeleton className="mt-2 h-10 w-3/5" />
          <div className="mt-8">
            <SkeletonText lines={7} />
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-[52px] w-full rounded-xl sm:w-48" />
            <Skeleton className="h-[52px] w-full rounded-xl sm:w-44" />
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="space-y-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-px w-full rounded-none" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Skeleton className="h-8 w-56" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonServiceCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Forms
   ========================================================================== */

/** A labelled input row: label above, field below. */
export function SkeletonField({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      <Skeleton className="h-3.5 w-28" />
      <Skeleton className="h-[46px] w-full rounded-xl" />
    </div>
  );
}

/** Two-column form body used by the contact and appointment pages. */
export function SkeletonForm({
  rows = 6,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-5 sm:grid-cols-2',
        className,
      )}
      aria-hidden="true"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className={cn(index === rows - 1 && 'sm:col-span-2')}
        >
          {index === rows - 1 ? (
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ) : (
            <SkeletonField />
          )}
        </div>
      ))}
      <div className="sm:col-span-2">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ==========================================================================
   Admin
   ========================================================================== */

/** Dashboard stat tile: icon, count, label and hint. */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-line bg-white p-5 shadow-sm', className)}
      aria-hidden="true"
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-4 w-4 rounded-sm" />
      </div>
      <Skeleton className="mt-4 h-8 w-16" />
      <Skeleton className="mt-2 h-3.5 w-28" />
      <Skeleton className="mt-2 h-3 w-36" />
    </div>
  );
}

/** One row of a recent-activity list, matching the `divide-y` layout. */
export function SkeletonListRow({ className }: { className?: string }) {
  return (
    <div className={cn('px-5 py-4', className)} aria-hidden="true">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-3.5 w-4/5" />
      <Skeleton className="mt-2 h-3 w-24" />
    </div>
  );
}

export function SkeletonListRows({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul className={cn('divide-y divide-line', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <SkeletonListRow />
        </li>
      ))}
    </ul>
  );
}

/** One skeleton row for an admin data table, shaped per `columns`. */
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-line/70" aria-hidden="true">
      {Array.from({ length: columns }, (_, index) => (
        <td key={index} className="px-5 py-4">
          <Skeleton className={cn('h-3.5', index === 0 ? 'w-32' : index === 1 ? 'w-24' : 'w-full')} />
          {index === 0 ? <Skeleton className="mt-2 h-3 w-24" /> : null}
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton body for an admin table.
 *
 * Keeps the table's header visible so the columns do not collapse and shift
 * when the real rows arrive.
 */
export function SkeletonTableRows({
  count = 6,
  columns = 5,
}: {
  count?: number;
  columns?: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonTableRow key={index} columns={columns} />
      ))}
    </>
  );
}

/** Placeholder matching the mobile card list shown under the admin table. */
export function SkeletonMobileList({ count = 4 }: { count?: number }) {
  return (
    <ul className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="p-4">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3.5 w-3/4" />
          <Skeleton className="mt-2 h-3.5 w-full" />
        </li>
      ))}
    </ul>
  );
}

/** One row of an admin list, including the action buttons on the right. */
export function SkeletonAdminRow({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-line bg-white p-5 shadow-sm', className)}
      aria-hidden="true"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="mt-3">
            <SkeletonText lines={2} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAdminList({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonAdminRow key={index} />
      ))}
    </div>
  );
}

/** Admin detail modal: heading, meta row and body copy. */
export function SkeletonModal({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-5', className)} aria-hidden="true">
      <div>
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-2 h-3.5 w-1/3" />
      </div>
      <Skeleton className="h-px w-full rounded-none" />
      <div>
        <SkeletonText lines={4} />
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>
  );
}

/** Admin settings / form page body. */
export function SkeletonFormPanel({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-4 rounded-2xl border border-line bg-white p-6">
          <Skeleton className="h-4 w-32" />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonField />
            <SkeletonField />
          </div>
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}