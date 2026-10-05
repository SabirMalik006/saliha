import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (input: Omit<Toast, 'id' | 'variant' | 'duration'> & { variant?: ToastVariant; duration?: number }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { wrapper: string; icon: ReactNode }> = {
  success: {
    wrapper: 'border-green-200 bg-white',
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />,
  },
  error: {
    wrapper: 'border-pink-200 bg-white',
    icon: <XCircle className="h-5 w-5 text-pink-600" aria-hidden="true" />,
  },
  warning: {
    wrapper: 'border-amber-200 bg-white',
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />,
  },
  info: {
    wrapper: 'border-blue-200 bg-white',
    icon: <Info className="h-5 w-5 text-blue-600" aria-hidden="true" />,
  },
};

let counter = 0;
const nextId = () => {
  counter += 1;
  return `toast-${counter}`;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());
  const prefersReducedMotion = usePrefersReducedMotion();

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback<ToastContextValue['toast']>(
    ({ title, description, variant = 'info', duration = 6000 }) => {
      const id = nextId();
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant, duration }]);
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [dismiss],
  );

  useEffect(() => {
    const store = timers.current;
    return () => {
      store.forEach((timer) => window.clearTimeout(timer));
      store.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      dismiss,
      success: (title, description) => toast({ title, description, variant: 'success' }),
      error: (title, description) => toast({ title, description, variant: 'error' }),
      info: (title, description) => toast({ title, description, variant: 'info' }),
      warning: (title, description) => toast({ title, description, variant: 'warning' }),
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-3 p-4 sm:inset-x-auto sm:right-0 sm:top-0 sm:items-end sm:justify-start"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg',
              VARIANT_STYLES[item.variant].wrapper,
              prefersReducedMotion ? '' : 'animate-[fade-up_0.25s_ease-out]',
            )}
          >
            <span className="mt-0.5 shrink-0">{VARIANT_STYLES[item.variant].icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy-800">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="-m-1 rounded-md p-1 text-ink-faint transition-colors hover:bg-app hover:text-navy-800"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
}