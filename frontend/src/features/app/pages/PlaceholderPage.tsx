import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

export function PlaceholderPage({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid place-items-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
        <Construction className="h-12 w-12 text-muted-foreground/70" />
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Esta seção será implementada na próxima sprint. Toda a navegação, layout
          e fluxo principal já estão preparados — basta plugar a página completa.
        </p>
      </div>
    </div>
  );
}
