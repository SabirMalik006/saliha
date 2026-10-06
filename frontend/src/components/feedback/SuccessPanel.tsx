import { Fragment, type ReactNode, type RefObject } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export interface SuccessPanelProps {
  title: string;
  message: string;
  /** Buttons shown beneath the confirmation. */
  actions?: ReactNode;
  /** Focus is moved here once the panel mounts, for screen-reader users. */
  panelRef?: RefObject<HTMLDivElement>;
  className?: string;
}

/**
 * Animated confirmation shown after a form submits successfully.
 *
 * A panel that appears silently is easy to miss, so the icon pops in, a ring
 * pulses outwards and the copy fades up in sequence. Everything collapses to a
 * static panel when the visitor prefers reduced motion.
 */
export function SuccessPanel({
  title,
  message,
  actions,
  panelRef,
  className,
}: SuccessPanelProps) {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <motion.div
      ref={panelRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={
        className ??
        'mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center outline-none'
      }
    >
      <motion.span
        initial={reduceMotion ? false : { scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.08 }}
        className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm"
      >
        {reduceMotion ? (
          <Fragment />
        ) : (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-green-400/40"
            initial={{ scale: 1, opacity: 0.75 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.18 }}
          />
        )}
        <CheckCircle2 className="relative h-8 w-8" aria-hidden="true" />
      </motion.span>

      <motion.h3
        {...fadeUp(0.18)}
        className="mt-4 text-xl font-semibold leading-snug text-navy-800 sm:text-2xl"
      >
        {title}
      </motion.h3>

      <motion.p
        {...fadeUp(0.26)}
        className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft"
      >
        {message}
      </motion.p>

      {actions ? (
        <motion.div {...fadeUp(0.34)} className="mt-6">
          {actions}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
