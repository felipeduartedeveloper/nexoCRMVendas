import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  settingsApi,
  labelsApi,
  lostReasonsApi,
  type CurrentOrganization,
} from '@/api/settings.api';
import { extractErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';

type Tab = 'general' | 'activities' | 'currencies' | 'lost-reasons' | 'labels';

const TABS: { value: Tab; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'activities', label: 'Activities' },
  { value: 'currencies', label: 'Currencies' },
  { value: 'lost-reasons', label: 'Lost reasons' },
  { value: 'labels', label: 'Labels' },
];

const MAINTENANCE_WINDOWS = [
  'No preference',
  '00:00 - 02:00 UTC',
  '02:00 - 04:00 UTC',
  '04:00 - 06:00 UTC',
  '06:00 - 08:00 UTC',
  '22:00 - 00:00 UTC',
];

export function GeneralPage() {
  const [tab, setTab] = useState<Tab>('general');

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Company settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure preferências gerais da sua empresa.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <nav className="flex overflow-x-auto border-b border-border" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition-colors',
                tab === t.value
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="p-6">
          {tab === 'general' && <GeneralFields />}
          {tab === 'activities' && (
            <Placeholder title="Tipos de atividade" hint="Personalize call, meeting, task etc." />
          )}
          {tab === 'currencies' && <CurrenciesTab />}
          {tab === 'lost-reasons' && <LostReasonsList />}
          {tab === 'labels' && <LabelsList />}
        </div>
      </div>
    </div>
  );
}

function GeneralFields() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['settings-org'], queryFn: settingsApi.currentOrg });

  const [draft, setDraft] = useState<Partial<CurrentOrganization>>({});

  useEffect(() => {
    if (q.data) setDraft(q.data);
  }, [q.data?.id]);

  const m = useMutation({
    mutationFn: (data: Partial<CurrentOrganization>) => settingsApi.updateCurrentOrg(data),
    onSuccess: async () => {
      toast.success('Configurações salvas.');
      await qc.invalidateQueries({ queryKey: ['settings-org'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (q.isLoading) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate(draft);
      }}
      className="space-y-5"
    >
      <Input
        label="Company name"
        value={draft.name ?? ''}
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        required
      />
      <div>
        <Input
          label="Company domain"
          placeholder="suaempresa.com.br"
          value={draft.domain ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, domain: e.target.value }))}
        />
        <p className="field-hint">
          O domínio é usado para o endereço Smart BCC e para a URL da sua conta no app web.
        </p>
      </div>
      <Input
        label="Website"
        placeholder="https://suaempresa.com.br"
        value={draft.website ?? ''}
        onChange={(e) => setDraft((d) => ({ ...d, website: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="País"
          value={draft.country ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
        />
        <Input
          label="Moeda padrão"
          placeholder="BRL"
          maxLength={3}
          value={draft.currency ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() }))}
        />
      </div>
      <div>
        <span className="field-label">Preferred system maintenance time (UTC)</span>
        <select
          value={draft.maintenanceWindowUtc ?? 'No preference'}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              maintenanceWindowUtc:
                e.target.value === 'No preference' ? null : e.target.value,
            }))
          }
          className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          {MAINTENANCE_WINDOWS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <Button type="submit" loading={m.isPending}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}

function CurrenciesTab() {
  const q = useQuery({ queryKey: ['settings-org'], queryFn: settingsApi.currentOrg });
  const supported = ['BRL', 'USD', 'EUR', 'GBP', 'ARS', 'MXN', 'CLP', 'COP'];
  const current = q.data?.currency ?? 'BRL';
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Moedas habilitadas para uso em deals, leads e relatórios.
      </p>
      <ul className="divide-y divide-border/50 rounded-lg border border-border">
        {supported.map((code) => (
          <li
            key={code}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <div>
              <span className="font-bold text-foreground">{code}</span>
              <span className="ml-2 text-muted-foreground">{currencyName(code)}</span>
            </div>
            {current === code ? (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                Padrão
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/70">Habilitada</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function currencyName(code: string): string {
  return (
    {
      BRL: 'Real brasileiro',
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      ARS: 'Peso argentino',
      MXN: 'Peso mexicano',
      CLP: 'Peso chileno',
      COP: 'Peso colombiano',
    }[code] ?? code
  );
}

function LostReasonsList() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['lost-reasons'], queryFn: lostReasonsApi.list });
  const [name, setName] = useState('');

  const create = useMutation({
    mutationFn: () => lostReasonsApi.create({ name }),
    onSuccess: async () => {
      toast.success('Motivo adicionado.');
      setName('');
      await qc.invalidateQueries({ queryKey: ['lost-reasons'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => lostReasonsApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['lost-reasons'] });
    },
  });

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Quando um deal é perdido, o vendedor pode escolher um destes motivos.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
        className="mb-4 flex gap-2"
      >
        <Input
          placeholder="Ex: Preço muito alto"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" loading={create.isPending}>
          Adicionar
        </Button>
      </form>
      <ul className="divide-y divide-border/50 rounded-lg border border-border">
        {q.data?.length ? (
          q.data.map((r) => (
            <li key={r.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-foreground">{r.name}</span>
              <button
                type="button"
                onClick={() => remove.mutate(r.id)}
                className="text-xs font-semibold text-danger hover:underline"
              >
                Remover
              </button>
            </li>
          ))
        ) : (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum motivo cadastrado.
          </li>
        )}
      </ul>
    </div>
  );
}

function LabelsList() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['labels-all'], queryFn: () => labelsApi.list() });
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [entityType, setEntityType] = useState<'DEAL' | 'CONTACT' | 'COMPANY' | 'LEAD' | 'ACTIVITY'>('DEAL');

  const create = useMutation({
    mutationFn: () => labelsApi.create({ name, color, entityType }),
    onSuccess: async () => {
      toast.success('Etiqueta adicionada.');
      setName('');
      await qc.invalidateQueries({ queryKey: ['labels-all'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => labelsApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['labels-all'] });
    },
  });

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        Etiquetas servem para classificar deals, contatos e mais.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) create.mutate();
        }}
        className="mb-4 flex flex-wrap items-end gap-2"
      >
        <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-border"
        />
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value as any)}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="DEAL">Deals</option>
          <option value="CONTACT">Contacts</option>
          <option value="COMPANY">Companies</option>
          <option value="LEAD">Leads</option>
          <option value="ACTIVITY">Activities</option>
        </select>
        <Button type="submit" loading={create.isPending}>
          Adicionar
        </Button>
      </form>
      <ul className="divide-y divide-border/50 rounded-lg border border-border">
        {q.data?.length ? (
          q.data.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
                <span className="font-semibold text-foreground">{l.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {l.entityType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => remove.mutate(l.id)}
                className="text-xs font-semibold text-danger hover:underline"
              >
                Remover
              </button>
            </li>
          ))
        ) : (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma etiqueta cadastrada.
          </li>
        )}
      </ul>
    </div>
  );
}

function Placeholder({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-border p-10 text-center">
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
