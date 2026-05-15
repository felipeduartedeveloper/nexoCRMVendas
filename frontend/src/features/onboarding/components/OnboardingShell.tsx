import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { cn } from '@/lib/cn';

interface Props {
  step: 1 | 2 | 3;
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightHero?: ReactNode;
}

const steps = [
  { idx: 1, label: 'Sobre você' },
  { idx: 2, label: 'Sobre a empresa' },
  { idx: 3, label: 'Tudo pronto' },
];

export function OnboardingShell({ step, title, subtitle, children, rightHero }: Props) {
  return (
    <div className="min-h-screen bg-card md:grid md:grid-cols-[1fr_minmax(0,40%)]">
      {/* Left: form column */}
      <div className="flex min-h-screen flex-col">
        <header className="container-wide flex items-center justify-between py-6">
          <Logo />
          <span className="text-sm text-muted-foreground">
            Etapa {step} de {steps.length}
          </span>
        </header>

        <div className="container-wide pb-2">
          <ol className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            {steps.map((s, i) => {
              const done = s.idx < step;
              const active = s.idx === step;
              return (
                <li key={s.idx} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold',
                      done
                        ? 'border-success bg-success text-white'
                        : active
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : s.idx}
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap',
                      (active || done) && 'text-foreground',
                    )}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      className={cn(
                        'h-px w-6 sm:w-12',
                        done ? 'bg-success' : 'bg-muted',
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <main className="container-wide flex-1 py-10">
          <div className="mx-auto max-w-xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>

      {/* Right: hero column */}
      <aside className="hidden bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 md:block">
        <div className="sticky top-0 flex h-screen flex-col justify-center px-12 text-white">
          {rightHero ?? (
            <>
              <div className="rounded-2xl bg-card/10 p-6 backdrop-blur">
                <p className="text-lg font-semibold leading-snug">
                  "Em 30 dias triplicamos o número de deals fechados. oxlify é simples
                  como uma planilha, poderoso como um CRM de verdade."
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-card/30" />
                  <div>
                    <div className="font-semibold">Carolina Mendes</div>
                    <div className="text-sm text-brand-100">Head of Sales · Acme Tech</div>
                  </div>
                </div>
              </div>
              <ul className="mt-8 space-y-2 text-sm text-brand-50">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Pipeline pronto em 1 minuto
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Importação CSV/XLSX nativa
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Times ilimitados nos planos Pro+
                </li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
