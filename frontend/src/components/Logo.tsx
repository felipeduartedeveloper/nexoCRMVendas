import { cn } from '@/lib/cn';

interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 32, withWordmark = true, className }: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="#2563eb" />
        <path d="M18 18h7v28h-7zM30 25h7v21h-7zM42 12h7v34h-7z" fill="#ffffff" />
      </svg>
      {withWordmark && (
        <span className="text-lg font-extrabold tracking-tight text-ink-900">
          CRM<span className="text-brand-600">Vendas</span>
        </span>
      )}
    </div>
  );
}
