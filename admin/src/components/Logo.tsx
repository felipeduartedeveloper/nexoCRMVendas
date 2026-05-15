import { cn } from '@/lib/cn';

export function Logo({
  size = 40,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-xl blur-md opacity-50"
          style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 55), oklch(0.55 0.25 35))' }}
        />
        <div
          className="relative w-full h-full rounded-xl flex items-center justify-center transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, oklch(0.65 0.22 55), oklch(0.55 0.25 35))' }}
        >
          <svg
            width={Math.round(size * 0.58)}
            height={Math.round(size * 0.58)}
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
            aria-hidden="true"
          >
            <circle cx="12" cy="6" r="2" fill="currentColor" />
            <circle cx="6" cy="18" r="2" fill="currentColor" />
            <circle cx="18" cy="18" r="2" fill="currentColor" />
            <path
              d="M12 8V12M12 12L7 16M12 12L17 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              nexo
            </span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CRM
            </span>
          </span>
          <span className="text-[11px] font-medium text-muted-foreground mt-0.5 tracking-wide">
            Vendas · Admin
          </span>
        </div>
      )}
    </div>
  );
}
