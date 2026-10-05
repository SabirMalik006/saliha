import {
  Baby,
  ClipboardCheck,
  Dna,
  Droplets,
  Eye,
  HeartPulse,
  Sprout,
  Stethoscope,
  UsersRound,
} from 'lucide-react';
import type { ServiceIconName } from '@/types';
import { cn } from '@/utils/cn';

export interface ServiceIconSpec {
  Icon: typeof Baby;
  /** Tailwind classes, one set per card tone. */
  tone: string;
  /** Accent colour used for the decorative corner motif. */
  accent: string;
}

/**
 * A unique, non-graphic icon per service.
 * No clinical or distressing imagery is used anywhere on this site.
 */
export const SERVICE_ICONS: Record<ServiceIconName, ServiceIconSpec> = {
  pregnancy: { Icon: Baby, tone: 'bg-pink-50 text-pink-600', accent: 'bg-pink-100' },
  menstrual: { Icon: Droplets, tone: 'bg-blue-50 text-blue-600', accent: 'bg-blue-100' },
  fertility: { Icon: Dna, tone: 'bg-navy-50 text-navy-600', accent: 'bg-navy-100' },
  'family-planning': { Icon: UsersRound, tone: 'bg-green-50 text-green-600', accent: 'bg-green-100' },
  delivery: { Icon: HeartPulse, tone: 'bg-pink-50 text-pink-600', accent: 'bg-pink-100' },
  menopause: { Icon: Sprout, tone: 'bg-green-50 text-green-600', accent: 'bg-green-100' },
  surgery: { Icon: Stethoscope, tone: 'bg-blue-50 text-blue-600', accent: 'bg-blue-100' },
  general: { Icon: ClipboardCheck, tone: 'bg-navy-50 text-navy-600', accent: 'bg-navy-100' },
  checkup: { Icon: Eye, tone: 'bg-blue-50 text-blue-600', accent: 'bg-blue-100' },
};

export const SERVICE_ICON_OPTIONS = Object.entries(SERVICE_ICONS).map(([value, spec]) => ({
  value,
  label: value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
  Icon: spec.Icon,
}));

interface ServiceIconProps {
  name: ServiceIconName | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { box: 'h-10 w-10 rounded-xl', icon: 'h-[1.125rem] w-[1.125rem]' },
  md: { box: 'h-12 w-12 rounded-xl', icon: 'h-6 w-6' },
  lg: { box: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
} as const;

export function ServiceIcon({ name, size = 'md', className }: ServiceIconProps) {
  const spec = SERVICE_ICONS[name as ServiceIconName] ?? SERVICE_ICONS.general;
  const sizing = SIZES[size];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        sizing.box,
        spec.tone,
        className,
      )}
    >
      <spec.Icon className={sizing.icon} aria-hidden="true" />
    </span>
  );
}