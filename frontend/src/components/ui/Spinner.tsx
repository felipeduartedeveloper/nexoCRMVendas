import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  size?: number;
  className?: string;
  label?: string;
  fullPage?: boolean;
}

export function Spinner({ size = 20, className, label, fullPage }: Props) {
  const content = (
    <div className={cn('inline-flex items-center gap-2 text-ink-500', className)}>
      <Loader2 className="animate-spin" width={size} height={size} aria-hidden />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
  if (fullPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        {content}
      </div>
    );
  }
  return content;
}
