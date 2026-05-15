import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles, X } from 'lucide-react';
import { marketingApi, type RecommendationType } from '@/api/marketing.api';

const TYPE_LABELS: Record<RecommendationType, string> = {
  REACTIVATE_INACTIVE: 'Reativação',
  FOLLOWUP_STALE_DEAL: 'Follow-up',
  UPSELL: 'Upsell',
  CROSS_SELL: 'Cross-sell',
  WELCOME_NEW: 'Boas-vindas',
};

export function RecommendationsPage() {
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ['marketing', 'recommendations'],
    queryFn: marketingApi.listRecommendations,
  });

  const generateMut = useMutation({
    mutationFn: marketingApi.generateRecommendations,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'recommendations'] }),
  });

  const acceptMut = useMutation({
    mutationFn: (id: string) => marketingApi.acceptRecommendation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'recommendations'] }),
  });
  const dismissMut = useMutation({
    mutationFn: (id: string) => marketingApi.dismissRecommendation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'recommendations'] }),
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Recomendações</h1>
          <p className="text-sm text-muted-foreground">
            Sugestões automáticas de ações de marketing baseadas no seu CRM.
          </p>
        </div>
        <button
          type="button"
          onClick={() => generateMut.mutate()}
          disabled={generateMut.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {generateMut.isPending ? 'Gerando...' : 'Gerar novas'}
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-auto p-6">
        {data.length === 0 && (
          <div className="grid place-items-center p-16 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-3 text-base font-semibold text-foreground">Sem recomendações</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Clique em "Gerar novas" pra receber sugestões automáticas.
            </p>
          </div>
        )}
        {data.map((r) => (
          <div
            key={r.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-card"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                  {TYPE_LABELS[r.type]}
                </span>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Impacto estimado: <strong>{r.estimatedImpact}</strong>
              </p>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => acceptMut.mutate(r.id)}
                title="Aceitar"
                className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success hover:bg-success/20"
              >
                <Check className="h-3.5 w-3.5" /> Aceitar
              </button>
              <button
                type="button"
                onClick={() => dismissMut.mutate(r.id)}
                title="Descartar"
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" /> Descartar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
