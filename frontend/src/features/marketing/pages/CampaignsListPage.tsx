import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Pause, Play, Plus, Send, Trash2 } from 'lucide-react';
import {
  CAMPAIGN_STATUS_LABELS,
  marketingApi,
  type CampaignStatus,
} from '@/api/marketing.api';
import { NewCampaignModal } from '../components/NewCampaignModal';

const STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: 'bg-ink-100 text-ink-700',
  SCHEDULED: 'bg-brand-50 text-brand-700',
  SENDING: 'bg-warning/10 text-warning',
  SENT: 'bg-success/10 text-success',
  PAUSED: 'bg-ink-100 text-ink-600',
  FAILED: 'bg-danger/10 text-danger',
};

export function CampaignsListPage() {
  const qc = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [status, setStatus] = useState<CampaignStatus | ''>('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['marketing', 'campaigns', status],
    queryFn: () => marketingApi.listCampaigns((status || undefined) as CampaignStatus | undefined),
  });

  const sendMut = useMutation({
    mutationFn: (id: string) => marketingApi.sendCampaignNow(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] }),
  });
  const pauseMut = useMutation({
    mutationFn: (id: string) => marketingApi.pauseCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => marketingApi.deleteCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] }),
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Campanhas</h1>
          <p className="text-sm text-ink-500">Crie, agende e acompanhe suas campanhas de email.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CampaignStatus | '')}
            className="h-9 rounded-md border border-ink-200 bg-white px-2 text-sm"
          >
            <option value="">Todas</option>
            {Object.entries(CAMPAIGN_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOpenNew(true)}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Nova campanha
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        {isLoading && <div className="p-8 text-sm text-ink-500">Carregando...</div>}
        {!isLoading && data.length === 0 && (
          <div className="grid place-items-center p-16 text-center">
            <Megaphone className="h-12 w-12 text-ink-300" />
            <h2 className="mt-3 text-base font-semibold text-ink-900">
              Sua primeira campanha começa aqui
            </h2>
            <p className="mt-1 max-w-sm text-sm text-ink-500">
              Crie campanhas de email para reativar contatos, anunciar promoções ou nutrir leads.
            </p>
            <button
              type="button"
              onClick={() => setOpenNew(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" /> Nova campanha
            </button>
          </div>
        )}
        {!isLoading && data.length > 0 && (
          <table className="min-w-full divide-y divide-ink-200 text-sm">
            <thead className="bg-ink-50 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Nome</th>
                <th className="px-3 py-2 text-left">Assunto</th>
                <th className="px-3 py-2 text-left">Audiência</th>
                <th className="px-3 py-2 text-left">Enviados</th>
                <th className="px-3 py-2 text-left">Abertura</th>
                <th className="px-3 py-2 text-left">Cliques</th>
                <th className="px-3 py-2 text-left">Quando</th>
                <th className="px-3 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-200 bg-white">
              {data.map((c) => {
                const opens =
                  c.metrics.sent > 0
                    ? Math.round((c.metrics.uniqueOpens / c.metrics.sent) * 100)
                    : 0;
                const clicks =
                  c.metrics.sent > 0
                    ? Math.round((c.metrics.uniqueClicks / c.metrics.sent) * 100)
                    : 0;
                return (
                  <tr key={c.id} className="hover:bg-ink-50">
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[c.status]}`}
                      >
                        {CAMPAIGN_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-ink-900">{c.name}</td>
                    <td className="px-3 py-2.5 text-ink-700">{c.subject}</td>
                    <td className="px-3 py-2.5 text-ink-700">{c.metrics.audienceSize}</td>
                    <td className="px-3 py-2.5 text-ink-700">{c.metrics.sent}</td>
                    <td className="px-3 py-2.5 text-ink-700">{opens}%</td>
                    <td className="px-3 py-2.5 text-ink-700">{clicks}%</td>
                    <td className="px-3 py-2.5 text-ink-500">
                      {c.sentAt
                        ? new Date(c.sentAt).toLocaleString('pt-BR')
                        : c.scheduledAt
                          ? `Agendada: ${new Date(c.scheduledAt).toLocaleString('pt-BR')}`
                          : 'Rascunho'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                          <button
                            type="button"
                            onClick={() => sendMut.mutate(c.id)}
                            title="Enviar agora"
                            className="grid h-7 w-7 place-items-center rounded text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {c.status === 'SCHEDULED' && (
                          <button
                            type="button"
                            onClick={() => pauseMut.mutate(c.id)}
                            title="Pausar"
                            className="grid h-7 w-7 place-items-center rounded text-ink-500 hover:bg-ink-100"
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {c.status === 'PAUSED' && (
                          <button
                            type="button"
                            onClick={() => sendMut.mutate(c.id)}
                            title="Retomar"
                            className="grid h-7 w-7 place-items-center rounded text-ink-500 hover:bg-ink-100"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Apagar campanha?')) deleteMut.mutate(c.id);
                          }}
                          title="Apagar"
                          className="grid h-7 w-7 place-items-center rounded text-ink-500 hover:bg-ink-100 hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <NewCampaignModal open={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
