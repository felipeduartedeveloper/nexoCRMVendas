import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import { cn } from '@/lib/cn';

interface Props {
  className?: string;
}

export function ThemeToggle({ className }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const dark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      title={dark ? 'Tema claro' : 'Tema escuro'}
      aria-label="Alternar tema"
      aria-pressed={dark}
      className={cn(
        'relative grid h-10 w-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60',
        className,
      )}
    >
      <Sun
        className={cn(
          'absolute h-5 w-5 transition-all duration-200',
          dark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
      />
      <Moon
        className={cn(
          'absolute h-5 w-5 transition-all duration-200',
          dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
        )}
      />
    </button>
  );
}
