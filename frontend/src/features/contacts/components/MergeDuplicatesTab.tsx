import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Merge, AlertTriangle, Mail } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { contactsApi } from '@/api/contacts.api';
import { extractErrorMessage } from '@/lib/api';

export function MergeDuplicatesTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['contacts-duplicates'], queryFn: contactsApi.duplicates });
  const [working, setWorking] = useState<string | null>(null);

  const merge = useMutation({
    mutationFn: ({ targetId, sourceIds }: { targetId: string; sourceIds: string[] }) =>
      contactsApi.merge(targetId, sourceIds),
    onMutate: ({ targetId }) => setWorking(targetId),
    onSuccess: async () => {
      toast.success('Contatos mesclados!');
      await qc.invalidateQueries({ queryKey: ['contacts-duplicates'] });
      await qc.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao mesclar.')),
    onSettled: () => setWorking(null),
  });

  if (q.isLoading) {
    return <div className="p-12 text-center text-sm text-ink-500">Procurando duplicatas…</div>;
  }

  const groups = q.data ?? [];

  if (!groups.length) {
    return (
      <div className="p-12 text-center">
        <Merge className="mx-auto h-10 w-10 text-success" />
        <p className="mt-3 text-sm font-semibold text-ink-900">Tudo limpo!</p>
        <p className="text-xs text-ink-500">Nenhum contato duplicado por e-mail encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning">
        <AlertTriangle className="h-4 w-4" />
        Encontramos {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'} de contatos com o
        mesmo e-mail. Selecione qual manter.
      </div>
      <ul className="space-y-3">
        {groups.map((g) => {
          const target = g.contactIds[0];
          const sources = g.contactIds.slice(1);
          return (
            <li
              key={g.email}
              className="rounded-xl border border-ink-200 bg-white p-4 shadow-card"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                    <Mail className="h-3.5 w-3.5 text-ink-400" /> {g.email}
                  </div>
                  <div className="text-xs text-ink-500">
                    {g.count} contatos com este e-mail
                  </div>
                </div>
                <Button
                  size="sm"
                  loading={working === target}
                  onClick={() => merge.mutate({ targetId: target, sourceIds: sources })}
                >
                  <Merge className="h-4 w-4" /> Mesclar em 1
                </Button>
              </div>
              <ul className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-xs text-ink-600">
                {g.contactIds.map((id, idx) => (
                  <li key={id} className="flex items-center gap-2">
                    <span
                      className={
                        'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ' +
                        (idx === 0
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-ink-100 text-ink-500')
                      }
                    >
                      {idx === 0 ? 'Manter' : 'Mesclar'}
                    </span>
                    <span className="font-mono">{id}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
