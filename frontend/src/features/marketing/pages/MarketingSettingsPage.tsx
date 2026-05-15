import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { marketingApi } from '@/api/marketing.api';

export function MarketingSettingsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['marketing', 'settings'],
    queryFn: marketingApi.getSettings,
  });

  const [senderDomain, setSenderDomain] = useState('');
  const [senderName, setSenderName] = useState('');
  const [defaultReplyTo, setDefaultReplyTo] = useState('');
  const [signatureHtml, setSignatureHtml] = useState('');

  useEffect(() => {
    if (data) {
      setSenderDomain(data.senderDomain ?? '');
      setSenderName(data.senderName ?? '');
      setDefaultReplyTo(data.defaultReplyTo ?? '');
      setSignatureHtml(data.signatureHtml ?? '');
    }
  }, [data?.id]);

  const mut = useMutation({
    mutationFn: () =>
      marketingApi.updateSettings({
        senderDomain: senderDomain || null,
        senderName: senderName || null,
        defaultReplyTo: defaultReplyTo || null,
        signatureHtml: signatureHtml || null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'settings'] }),
  });

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-xl font-bold text-foreground">Domínio e envio</h1>
        <p className="text-sm text-muted-foreground">
          Configure remetente padrão e verifique autenticação DKIM/SPF.
        </p>
      </header>

      <div className="flex-1 space-y-4 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="field-label">Domínio do remetente</span>
            <input
              value={senderDomain}
              onChange={(e) => setSenderDomain(e.target.value)}
              placeholder="empresa.com.br"
              className="h-9 w-full rounded-md border border-border px-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="field-label">Nome padrão</span>
            <input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Equipe Vendas"
              className="h-9 w-full rounded-md border border-border px-2 text-sm"
            />
          </label>
          <label className="block col-span-2">
            <span className="field-label">Email padrão de reply-to</span>
            <input
              type="email"
              value={defaultReplyTo}
              onChange={(e) => setDefaultReplyTo(e.target.value)}
              placeholder="contato@empresa.com.br"
              className="h-9 w-full rounded-md border border-border px-2 text-sm"
            />
          </label>
          <label className="block col-span-2">
            <span className="field-label">Assinatura (HTML)</span>
            <textarea
              value={signatureHtml}
              onChange={(e) => setSignatureHtml(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-border px-2 py-1.5 font-mono text-xs"
            />
          </label>
        </div>

        <div>
          <p className="field-label">Autenticação do remetente</p>
          <div className="grid grid-cols-2 gap-2">
            <StatusBadge label="DKIM" verified={!!data?.dkimVerified} />
            <StatusBadge label="SPF" verified={!!data?.spfVerified} />
          </div>
          <p className="field-hint">
            Configure registros DNS no seu provedor pra autenticar o domínio.
          </p>
        </div>

        {data?.unsubscribeUrl && (
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="text-xs font-semibold text-muted-foreground">URL pública de unsubscribe</p>
            <code className="mt-1 block text-xs text-foreground">{data.unsubscribeUrl}</code>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => mut.mutate()}
            disabled={mut.isPending}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mut.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, verified }: { label: string; verified: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border p-3 ${
        verified ? 'border-success/30 bg-success/5' : 'border-border bg-muted/40'
      }`}
    >
      {verified ? (
        <ShieldCheck className="h-5 w-5 text-success" />
      ) : (
        <ShieldX className="h-5 w-5 text-muted-foreground/70" />
      )}
      <div>
        <p className="font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{verified ? 'Verificado' : 'Não configurado'}</p>
      </div>
    </div>
  );
}
