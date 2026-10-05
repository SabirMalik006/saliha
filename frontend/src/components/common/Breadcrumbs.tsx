import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the current page. */
  to?: string;
}

export function Breadcrumbs({
  items,
  tone = 'light',
  className,
}: {
  items: BreadcrumbItem[];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const isDark = tone === 'dark';

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          'flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm',
          isDark ? 'text-blue-200' : 'text-ink-soft',
        )}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className={cn(
                    'rounded font-medium transition-colors hover:underline',
                    isDark ? 'hover:text-white' : 'text-ink-soft hover:text-navy-800',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn('font-semibold', isDark ? 'text-white' : 'text-navy-800')}
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <ChevronRight
                  className={cn('h-3.5 w-3.5 shrink-0', isDark ? 'text-blue-300' : 'text-ink-faint')}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}