import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone =
  | 'navy'
  | 'blue'
  | 'pink'
  | 'green'
  | 'neutral'
  | 'amber'
  | 'red'
  | 'purple';

const TONES: Record<BadgeTone, string> = {
  navy: 'bg-navy-50 text-navy-700 ring-navy-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  pink: 'bg-pink-50 text-pink-700 ring-pink-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-pink-50 text-pink-700 ring-pink-300',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200',
};

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

/**
 * Status is always communicated with a text label as well as colour, so the
 * meaning never depends on colour alone (WCAG 1.4.1).
 */
export function Badge({
  tone = 'neutral',
  icon,
  size = 'sm',
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const STATUS_TONES = {
  new: 'blue',
  contacted: 'amber',
  closed: 'neutral',
  confirmed: 'green',
  completed: 'navy',
  cancelled: 'red',
} as const;

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status as keyof typeof STATUS_TONES] ?? 'neutral';
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge tone={tone} size="sm">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
      />
      {label}
    </Badge>
  );
}