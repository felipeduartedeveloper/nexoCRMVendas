import { cn } from '@/lib/cn';

export function Logo({
  size = 32,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="#f97316" />
        <path d="M20 18h7v28h-7zM32 25h7v21h-7zM44 12h7v34h-7z" fill="#ffffff" />
      </svg>
      {withWordmark && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-extrabold tracking-tight text-ink-900">
            CRM<span className="text-brand-600">Vendas</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
            SaaS Console
          </span>
        </div>
      )}
    </div>
  );
}
