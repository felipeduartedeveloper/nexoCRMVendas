import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm focus-visible:ring-brand-300',
  secondary:
    'bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300 focus-visible:ring-ink-300',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 focus-visible:ring-ink-300',
  outline:
    'border border-ink-300 bg-white text-ink-800 hover:bg-ink-50 active:bg-ink-100 focus-visible:ring-ink-300',
  danger:
    'bg-danger text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-300',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    { variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, ...rest },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
