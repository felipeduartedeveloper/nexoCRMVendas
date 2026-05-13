import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, error, leftSlot, rightSlot, className, id, ...rest }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="field-label">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border bg-white px-3 transition-colors focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200',
            error ? 'border-danger' : 'border-ink-300 hover:border-ink-400',
            rest.disabled && 'cursor-not-allowed bg-ink-50',
          )}
        >
          {leftSlot && <span className="text-ink-400">{leftSlot}</span>}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'h-10 w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none',
              className,
            )}
            {...rest}
          />
          {rightSlot && <span className="text-ink-400">{rightSlot}</span>}
        </div>
        {hint && !error && <p className="field-hint">{hint}</p>}
        {error && <p className="field-error">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
