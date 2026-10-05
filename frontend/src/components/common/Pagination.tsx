import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Announced context, e.g. "appointment requests". */
  label?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  label = 'records',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageWindow(page, totalPages);

  return (
    <nav
      aria-label={`${label} pagination`}
      className={cn('flex flex-wrap items-center justify-between gap-4', className)}
    >
      <p className="text-sm text-ink-soft">
        Page <span className="font-semibold text-navy-800">{page}</span> of{' '}
        <span className="font-semibold text-navy-800">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line bg-white px-2 text-ink-soft transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-navy-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        {pages.map((entry, index) =>
          entry === 'ellipsis' ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1.5 text-sm text-ink-faint"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-current={entry === page ? 'page' : undefined}
              aria-label={`Page ${entry}`}
              className={cn(
                'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors',
                entry === page
                  ? 'border-navy-800 bg-navy-800 text-white'
                  : 'border-line bg-white text-ink-soft hover:border-blue-300 hover:bg-blue-50 hover:text-navy-800',
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-line bg-white px-2 text-ink-soft transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-navy-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

/** Compact page window: 1 … 4 [5] 6 … 20 */
function getPageWindow(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) pages.push('ellipsis');
  for (let value = start; value <= end; value += 1) pages.push(value);
  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
}