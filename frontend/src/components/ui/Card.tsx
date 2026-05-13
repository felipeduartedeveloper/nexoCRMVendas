import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink-200 bg-white shadow-card',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6', className)} {...rest} />;
}

export function CardHeader({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-ink-200 p-6', className)} {...rest} />;
}
