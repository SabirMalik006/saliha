import type { ElementType, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Container({
  as: Tag = 'div',
  size = 'default',
  className,
  children,
}: {
  as?: ElementType;
  size?: 'default' | 'narrow' | 'admin';
  className?: string;
  children: ReactNode;
}) {
  const sizing =
    size === 'narrow'
      ? 'container-narrow'
      : size === 'admin'
        ? 'container-admin'
        : 'container-page';
  return <Tag className={cn(sizing, className)}>{children}</Tag>;
}

export function Section({
  as: Tag = 'section',
  tone = 'white',
  padding = 'lg',
  className,
  children,
  id,
  labelledBy,
}: {
  as?: ElementType;
  tone?: 'white' | 'app' | 'pink' | 'navy' | 'subtle';
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
  id?: string;
  labelledBy?: string;
}) {
  const tones = {
    white: 'bg-white',
    app: 'bg-app',
    pink: 'bg-app-pink',
    navy: 'bg-navy-800 text-white',
    subtle: 'bg-surface-muted',
  } as const;

  const paddings = {
    sm: 'py-10 sm:py-12',
    md: 'py-14 sm:py-16 lg:py-20',
    lg: 'py-16 sm:py-20 lg:py-24',
  } as const;

  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(tones[tone], paddings[padding], className)}
    >
      {children}
    </Tag>
  );
}

interface EyebrowProps {
  children: ReactNode;
  tone?: 'light' | 'pink' | 'blue' | 'green';
  className?: string;
}

/** Small uppercase label used above section headings. */
export function Eyebrow({ children, tone = 'light', className }: EyebrowProps) {
  const tones = {
    light: 'bg-white/10 text-blue-100 ring-white/20',
    pink: 'bg-pink-50 text-pink-700 ring-pink-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    green: 'bg-green-50 text-green-700 ring-green-200',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  headingLevel?: 1 | 2;
  tone?: 'dark' | 'light';
  className?: string;
  id?: string;
  /** Extra controls rendered beside the heading (e.g. a "View all" link). */
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  headingLevel = 2,
  tone = 'dark',
  className,
  id,
  action,
}: SectionHeadingProps) {
  const Heading = `h${headingLevel}` as 'h1' | 'h2';
  const isLight = tone === 'light';

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start',
        action ? 'sm:flex-row sm:items-end sm:justify-between sm:gap-8' : undefined,
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto' : undefined)}>
        {eyebrow ? (
          <div className={cn('mb-3 flex', align === 'center' && 'justify-center')}>
            <Eyebrow tone={isLight ? 'light' : 'pink'}>{eyebrow}</Eyebrow>
          </div>
        ) : null}

        <Heading
          id={id}
          className={cn(
            'text-[1.75rem] leading-[1.18] sm:text-[2.125rem] lg:text-[2.5rem]',
            isLight ? 'text-white' : 'text-navy-800',
          )}
        >
          {title}
        </Heading>

        {description ? (
          <p
            className={cn(
              'mt-4 text-base leading-relaxed sm:text-[1.0625rem]',
              isLight ? 'text-blue-100' : 'text-ink-soft',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}