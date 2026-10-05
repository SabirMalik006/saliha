import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SERVICE_ICONS, ServiceIcon } from './ServiceIcon';
import { routes } from '@/routes/paths';
import { cn } from '@/utils/cn';
import type { Service, ServiceIconName } from '@/types';

export interface ServiceCardProps {
  service: Service;
  className?: string;
  /** Compact cards fit the Home page grid; full cards suit the listing page. */
  variant?: 'compact' | 'default';
}

/**
 * Service card.
 *
 * Shows the service photograph when the clinic has uploaded one, and falls back
 * to a branded icon panel otherwise — so the grid always looks finished.
 * The whole card is one click target (the title link stretches over it).
 */
export function ServiceCard({ service, className, variant = 'default' }: ServiceCardProps) {
  const headingId = `service-${service.id}-title`;
  const spec = SERVICE_ICONS[service.icon as ServiceIconName] ?? SERVICE_ICONS.general;
  const photo = service.imageUrl && service.imageUrl.trim() !== '' ? service.imageUrl : null;
  const compact = variant === 'compact';

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-300',
        'hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_28px_50px_-28px_rgba(16,45,85,0.4)]',
        'focus-within:-translate-y-1.5 focus-within:border-blue-200 focus-within:shadow-[0_28px_50px_-28px_rgba(16,45,85,0.4)]',
        className,
      )}
    >
      {/* Media */}
      <div
        className={cn(
          'relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-pink-50',
          compact ? 'aspect-[16/10]' : 'aspect-[16/10] sm:aspect-[3/2]',
        )}
      >
        {photo ? (
          <img
            src={photo}
            alt={service.imageAlt?.trim() ? service.imageAlt : ''}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <span
              aria-hidden="true"
              className={cn('absolute h-40 w-40 rounded-full blur-2xl', spec.accent)}
            />
            <span
              className={cn(
                'relative flex items-center justify-center rounded-3xl bg-white/90 shadow-sm ring-1 ring-black/5 backdrop-blur',
                compact ? 'h-16 w-16' : 'h-20 w-20',
              )}
            >
              <spec.Icon
                className={cn('text-current', compact ? 'h-7 w-7' : 'h-9 w-9', spec.tone.split(' ')[1])}
                aria-hidden="true"
              />
            </span>
          </span>
        )}

        {/* Legibility scrim for the floating badge */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-navy-900/35 to-transparent"
        />

        <span className="absolute bottom-3 left-3">
          <ServiceIcon
            name={service.icon}
            size="sm"
            className="bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur"
          />
        </span>

        {service.featured ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-pink-600 shadow-sm ring-1 ring-black/5 backdrop-blur">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Popular
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className={cn('flex flex-1 flex-col', compact ? 'p-5' : 'p-5 sm:p-6')}>
        <h3
          id={headingId}
          className={cn(
            'font-semibold leading-snug text-navy-800',
            compact ? 'text-[1.0625rem]' : 'text-lg',
          )}
        >
          <Link
            to={routes.serviceDetail(service.slug)}
            className="rounded after:absolute after:inset-0 after:rounded-3xl after:content-[''] transition-colors group-hover:text-blue-700"
          >
            {service.title}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
          {service.shortDescription}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors group-hover:text-pink-600">
          View details
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </article>
  );
}

/** Even grid of service cards — one implementation, reused everywhere. */
export function ServiceGrid({
  services,
  variant = 'default',
  className,
  columns = 4,
}: {
  services: Service[];
  variant?: 'compact' | 'default';
  className?: string;
  columns?: 3 | 4;
}) {
  return (
    <div
      className={cn(
        'grid gap-5',
        columns === 4
          ? 'sm:grid-cols-2 xl:grid-cols-4'
          : 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} variant={variant} />
      ))}
    </div>
  );
}
