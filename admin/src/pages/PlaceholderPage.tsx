import { Construction } from 'lucide-react';

export function PlaceholderPage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
      <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-ink-300 bg-white p-12 text-center">
        <Construction className="h-10 w-10 text-ink-400" />
        <p className="mt-3 max-w-md text-sm text-ink-600">
          Sprint 2: módulo completo do SaaS Console.
        </p>
      </div>
    </div>
  );
}
