import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardTone = 'default' | 'raised' | 'tinted' | 'pink' | 'navy';

const TONES: Record<CardTone, string> = {
  default: 'border-line bg-white shadow-sm',
  raised: 'border-line bg-white shadow-md',
  tinted: 'border-blue-100 bg-blue-50/60',
  pink: 'border-pink-100 bg-pink-50',
  navy: 'border-navy-700 bg-navy-800 text-white',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: ElementType;
  interactive?: boolean;
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-7',
} as const;

export function Card({
  tone = 'default',
  padding = 'md',
  as: Tag = 'div',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-2xl',
        TONES[tone],
        PADDING[padding],
        interactive &&
          'transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon,
  className,
  headingLevel = 3,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <div className={cn('flex items-start gap-3', className)}>
      {icon ? (
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <Heading className="text-base font-semibold text-navy-800 sm:text-lg">{title}</Heading>
        {subtitle ? <p className="mt-1 text-sm text-ink-soft">{subtitle}</p> : null}
      </div>
    </div>
  );
}