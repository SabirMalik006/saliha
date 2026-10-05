import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ServiceIcon } from './ServiceIcon';
import { routes } from '@/routes/paths';
import { cn } from '@/utils/cn';
import type { Service } from '@/types';

export interface ServiceCardProps {
  service: Service;
  className?: string;
  /** Compact cards fit the Home page grid; full cards suit the listing page. */
  variant?: 'compact' | 'default';
}

export function ServiceCard({ service, className, variant = 'default' }: ServiceCardProps) {
  const headingId = `service-${service.id}-title`;

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-sm transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus-within:-translate-y-1 focus-within:border-blue-200 focus-within:shadow-lg sm:p-6',
        className,
      )}
    >
      <ServiceIcon name={service.icon} size={variant === 'compact' ? 'md' : 'lg'} />

      <h3
        id={headingId}
        className={cn(
          'mt-4 font-semibold text-navy-800',
          variant === 'compact' ? 'text-[1.0625rem]' : 'text-lg',
        )}
      >
        <Link
          to={routes.serviceDetail(service.slug)}
          className="rounded after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:text-blue-600"
        >
          {service.title}
        </Link>
      </h3>

      <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
        {service.shortDescription}
      </p>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors group-hover:text-pink-600">
        View Details
        <ArrowRight
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
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