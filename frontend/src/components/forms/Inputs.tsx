import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AlertCircle, Check, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { Field, controlClasses, FieldError } from './Field';
import { cn } from '@/utils/cn';

type BaseInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  labelAdornment?: ReactNode;
  inputClassName?: string;
};

function LabelAdornmentSpan({ children }: { children: ReactNode }) {
  return <span className="shrink-0">{children}</span>;
}

export const TextInput = forwardRef<HTMLInputElement, BaseInputProps>(function TextInput(
  { label, error, hint, containerClassName, labelAdornment, inputClassName, id, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <Field
      id={fieldId}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={containerClassName}
      labelAdornment={
        labelAdornment ? <LabelAdornmentSpan>{labelAdornment}</LabelAdornmentSpan> : undefined
      }
    >
      {(aria) => (
        <div className="relative">
          {rest.type === 'tel' ? (
            <AlertCircle
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
          ) : null}
          <input
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={aria['aria-invalid']}
            aria-describedby={aria['aria-describedby']}
            className={cn(
              controlClasses(Boolean(error), inputClassName),
              'min-h-[48px]',
              rest.type === 'tel' && 'pl-10',
            )}
            {...rest}
          />
        </div>
      )}
    </Field>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, BaseInputProps>(
  function PasswordInput(
    { label, error, hint, containerClassName, labelAdornment, inputClassName, id, required, ...rest },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [isVisible, setIsVisible] = useState(false);
    const toggleId = `${fieldId}-toggle`;

    return (
      <Field
        id={fieldId}
        label={label}
        required={required}
        error={error}
        hint={hint}
        className={containerClassName}
        labelAdornment={
          labelAdornment ? <LabelAdornmentSpan>{labelAdornment}</LabelAdornmentSpan> : undefined
        }
      >
        {(aria) => (
          <div className="relative">
            <input
              ref={ref}
              id={fieldId}
              type={isVisible ? 'text' : 'password'}
              required={required}
              aria-invalid={aria['aria-invalid']}
              aria-describedby={[aria['aria-describedby'], toggleId].filter(Boolean).join(' ')}
              className={cn(
                controlClasses(Boolean(error), inputClassName),
                'min-h-[48px] pr-12',
              )}
              {...rest}
            />
            <button
              type="button"
              id={toggleId}
              onClick={() => setIsVisible((visible) => !visible)}
              aria-label={isVisible ? 'Hide password' : 'Show password'}
              aria-pressed={isVisible}
              className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint transition-colors hover:bg-app hover:text-navy-800"
            >
              {isVisible ? (
                <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
              ) : (
                <Eye className="h-4.5 w-4.5" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </Field>
    );
  },
);

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  labelAdornment?: ReactNode;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, containerClassName, labelAdornment, id, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <Field
      id={fieldId}
      label={label}
      required={required}
      error={error}
      hint={hint}
      className={containerClassName}
      labelAdornment={
        labelAdornment ? <LabelAdornmentSpan>{labelAdornment}</LabelAdornmentSpan> : undefined
      }
    >
      {(aria) => (
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={aria['aria-invalid']}
          aria-describedby={aria['aria-describedby']}
          className={cn(controlClasses(Boolean(error)), 'min-h-[140px] resize-y py-3 leading-relaxed')}
          {...rest}
        />
      )}
    </Field>
  );
});

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'children'> & {
  label: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  containerClassName?: string;
};

export const SelectInput = forwardRef<HTMLSelectElement, SelectProps>(function SelectInput(
  { label, error, hint, options, placeholder, containerClassName, id, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <Field id={fieldId} label={label} required={required} error={error} hint={hint} className={containerClassName}>
      {(aria) => (
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={aria['aria-invalid']}
            aria-describedby={aria['aria-describedby']}
            className={cn(
              controlClasses(Boolean(error)),
              'min-h-[48px] cursor-pointer appearance-none pr-11',
            )}
            {...rest}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden="true"
          />
        </div>
      )}
    </Field>
  );
});

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> & {
  label: ReactNode;
  error?: string;
  hint?: string;
  containerClassName?: string;
};

/**
 * Consent checkbox. A real checkbox is used (not a styled div) so keyboard
 * and screen-reader behaviour is correct; the error is textually associated.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, hint, containerClassName, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={containerClassName}>
      <div className="flex items-start gap-3">
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={[error ? errorId : null, hint ? hintId : null]
              .filter(Boolean)
              .join(' ')}
            className={cn(
              'peer h-5 w-5 cursor-pointer appearance-none rounded-md border bg-white transition-colors',
              error
                ? 'border-pink-400 checked:border-pink-600'
                : 'border-line-strong checked:border-navy-800 hover:border-blue-400',
              'checked:bg-navy-800',
            )}
            {...rest}
          />
          <Check
            className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
            aria-hidden="true"
            strokeWidth={3}
          />
        </span>

        <label htmlFor={fieldId} className="cursor-pointer text-sm leading-relaxed text-ink">
          {label}
        </label>
      </div>

      {hint ? (
        <p id={hintId} className="mt-1.5 pl-9 text-xs leading-relaxed text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div className="pl-9">
        <FieldError id={errorId} message={error} />
      </div>
    </div>
  );
});

/** Character counter used next to textarea labels. */
export function CharacterCount({ value, max }: { value: string; max: number }) {
  const length = value.trim().length;
  const isNearLimit = length > max * 0.9;

  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        isNearLimit ? 'font-semibold text-pink-600' : 'text-ink-faint',
      )}
    >
      {length}/{max}
    </span>
  );
}