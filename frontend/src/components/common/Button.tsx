import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'whatsapp'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,color,box-shadow,transform,border-color] duration-200 disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-px whitespace-nowrap';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-navy-800 text-white shadow-sm hover:bg-navy-700 hover:shadow-md focus-visible:outline-navy-800',
  accent:
    'bg-pink-500 text-white shadow-sm hover:bg-pink-600 hover:shadow-md focus-visible:outline-pink-600',
  secondary:
    'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow-md focus-visible:outline-blue-700',
  outline:
    'border border-line-strong bg-white text-navy-800 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-blue-600',
  ghost: 'text-navy-800 hover:bg-blue-50 focus-visible:outline-blue-600',
  whatsapp:
    'bg-green-500 text-white shadow-sm hover:bg-green-600 hover:shadow-md focus-visible:outline-green-600',
  danger:
    'bg-pink-600 text-white shadow-sm hover:bg-pink-700 hover:shadow-md focus-visible:outline-pink-700',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-[38px] px-3.5 text-sm',
  md: 'min-h-[44px] px-5 text-[0.9375rem]',
  lg: 'min-h-[52px] px-7 text-base sm:text-[1.0625rem]',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {}

/** Minimum 44x44px touch target on `md` and above. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

export interface ButtonLinkProps extends CommonProps {
  to: string;
  external?: boolean;
  'aria-label'?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

/**
 * Router link styled as a button, or an anchor when `external` is set.
 * Both variants stay real, focusable, keyboard-operable elements.
 */
export function ButtonLink({
  to,
  external = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);

  if (external) {
    return (
      <a
        href={to}
        className={classes}
        target={rest.target ?? '_blank'}
        rel={rest.rel ?? 'noopener noreferrer'}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }

  const linkProps: LinkProps = {
    to,
    className: classes,
    ...(rest['aria-label'] ? { 'aria-label': rest['aria-label'] } : {}),
    ...(rest.onClick ? { onClick: rest.onClick } : {}),
  };

  return (
    <Link {...linkProps}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}