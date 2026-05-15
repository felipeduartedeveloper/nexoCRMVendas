import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Inbox,
  Bot,
  MessageCircle,
  FileText,
  Search,
  Globe,
  Linkedin,
  Plus,
  Upload,
  ArrowRight,
  Sparkles,
  Send,
  Building2,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { leadsApi, type Lead, type LeadStatus } from '@/api/leads.api';
import { extractErrorMessage } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

type Section =
  | 'leads-inbox'
  | 'live-chat'
  | 'chatbot'
  | 'web-forms'
  | 'prospector'
  | 'web-visitors'
  | 'linkedin';

const MENU: {
  group: string;
  items: { value: Section; label: string; icon: any }[];
}[] = [
  {
    group: 'Leads',
    items: [{ value: 'leads-inbox', label: 'Leads Inbox', icon: Inbox }],
  },
  {
    group: 'LeadBooster',
    items: [
      { value: 'live-chat', label: 'Live Chat', icon: MessageCircle },
      { value: 'chatbot', label: 'Chatbot', icon: Bot },
      { value: 'web-forms', label: 'Web Forms', icon: FileText },
      { value: 'prospector', label: 'Prospector', icon: Search },
    ],
  },
  {
    group: 'Add-ons',
    items: [{ value: 'web-visitors', label: 'Web Visitors', icon: Globe }],
  },
  {
    group: 'Integrations',
    items: [{ value: 'linkedin', label: 'LinkedIn', icon: Linkedin }],
  },
];

export function LeadsPage() {
  const [section, setSection] = useState<Section>('leads-inbox');

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Leads"
        subtitle="Capture, qualifique e converta leads em deals."
      />

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-ink-200 bg-white p-3 shadow-card">
          {MENU.map((g) => (
            <div key={g.group} className="mb-4 last:mb-0">
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-500">
                {g.group}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.value}>
                    <button
                      type="button"
                      onClick={() => setSection(it.value)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        section === it.value
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-700 hover:bg-ink-100',
                      )}
                    >
                      <it.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{it.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        <main className="min-w-0">
          {section === 'leads-inbox' && <LeadsInbox />}
          {section === 'live-chat' && (
            <FeatureCard
              icon={MessageCircle}
              title="Live Chat"
              tagline="Converse com visitantes do site em tempo real."
              description="Embed um widget de chat no seu site para capturar leads aquecidos no momento certo. Cada conversa vira um lead automaticamente."
              cta="Instalar widget"
            />
          )}
          {section === 'chatbot' && (
            <FeatureCard
              icon={Bot}
              title="Chatbot"
              tagline="Qualifique leads 24/7 com fluxos personalizados."
              description="Crie chatbots no-code que perguntam, qualificam e atribuem leads automaticamente ao vendedor certo, em qualquer horário."
              cta="Criar primeiro bot"
            />
          )}
          {section === 'web-forms' && (
            <FeatureCard
              icon={FileText}
              title="Web Forms"
              tagline="Formulários customizáveis para o seu site."
              description="Crie formulários, embed no site, gere leads automaticamente. Suporte a campos customizados, validação e webhook."
              cta="Criar formulário"
            />
          )}
          {section === 'prospector' && (
            <FeatureCard
              icon={Search}
              title="Prospector"
              tagline="Encontre leads B2B usando filtros avançados."
              description="Base de dados de mais de 400 milhões de profissionais com filtros por indústria, cargo, localização e tamanho da empresa."
              cta="Buscar agora"
            />
          )}
          {section === 'web-visitors' && (
            <FeatureCard
              icon={Globe}
              title="Web Visitors"
              tagline="Veja quais empresas estão visitando seu site."
              description="Identificação por IP reverso de empresas anônimas que visitaram seu site. Veja jornada, páginas vistas e tempo gasto."
              cta="Habilitar tracking"
            />
          )}
          {section === 'linkedin' && (
            <FeatureCard
              icon={Linkedin}
              title="LinkedIn Sales Navigator"
              tagline="Integração nativa com o LinkedIn."
              description="Importe leads do LinkedIn Sales Navigator direto para o CRM, sincronize histórico de mensagens InMail e veja perfis no contexto do deal."
              cta="Conectar conta"
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LeadsInbox() {
  const qc = useQueryClient();
  const [openNew, setOpenNew] = useState(false);

  const q = useQuery({
    queryKey: ['leads-all'],
    queryFn: () => leadsApi.list({ limit: 200 }),
  });
  const counters = useQuery({ queryKey: ['leads-counters'], queryFn: leadsApi.counters });

  const archive = useMutation({
    mutationFn: (id: string) => leadsApi.archive(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['leads-all'] });
      await qc.invalidateQueries({ queryKey: ['leads-counters'] });
    },
  });

  const convert = useMutation({
    mutationFn: (id: string) => leadsApi.convert(id),
    onSuccess: async () => {
      toast.success('Lead convertido em deal!');
      await qc.invalidateQueries({ queryKey: ['leads-all'] });
      await qc.invalidateQueries({ queryKey: ['leads-counters'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
    { status: 'INBOX', label: 'Inbox', color: 'border-brand-500' },
    { status: 'WORKING', label: 'Working', color: 'border-warning' },
    { status: 'ARCHIVED', label: 'Archived', color: 'border-ink-400' },
    { status: 'CONVERTED', label: 'Converted', color: 'border-success' },
  ];

  const byStatus: Record<LeadStatus, Lead[]> = {
    INBOX: [],
    WORKING: [],
    ARCHIVED: [],
    CONVERTED: [],
  };
  (q.data?.items ?? []).forEach((l) => byStatus[l.status].push(l));

  const total =
    (counters.data?.inbox ?? 0) +
    (counters.data?.working ?? 0) +
    (counters.data?.archived ?? 0) +
    (counters.data?.converted ?? 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Leads Inbox</h2>
          <p className="text-sm text-ink-600">{total} leads no total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4" /> Importar planilha
          </Button>
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="h-4 w-4" /> Novo lead
          </Button>
        </div>
      </div>

      {!total && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-brand-500" />
          <h3 className="mt-3 text-xl font-extrabold text-ink-900">
            Take your leads to the next level
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-700">
            Add new lead or import your existing leads from spreadsheet.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button onClick={() => setOpenNew(true)}>
              <Plus className="h-4 w-4" /> Novo lead
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Importar
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-4">
        {COLUMNS.map((c) => {
          const list = byStatus[c.status];
          const total = list.reduce((acc, l) => acc + Number(l.value || 0), 0);
          return (
            <div key={c.status} className="min-h-[300px]">
              <div className={cn('mb-2 rounded-t-lg border-b-2 bg-white p-3', c.color)}>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                  <span className="text-ink-900">{c.label}</span>
                  <span className="text-ink-500">{list.length}</span>
                </div>
                <div className="mt-1 text-[11px] text-ink-500">
                  {formatMoney(total, list[0]?.currency ?? 'BRL')}
                </div>
              </div>
              <div className="space-y-2 rounded-b-lg bg-ink-50 p-2">
                {!list.length ? (
                  <div className="grid h-20 place-items-center rounded-lg border border-dashed border-ink-300 text-xs text-ink-400">
                    Sem leads
                  </div>
                ) : (
                  list.map((l) => (
                    <div
                      key={l.id}
                      className="rounded-lg border border-ink-200 bg-white p-3 shadow-card"
                    >
                      <div className="line-clamp-2 text-sm font-semibold text-ink-900">
                        {l.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="rounded-full bg-success/10 px-2 py-0.5 font-bold text-success">
                          {formatMoney(l.value, l.currency)}
                        </span>
                        {l.source && (
                          <span className="inline-flex items-center gap-1 text-ink-500">
                            <Building2 className="h-3 w-3" /> {l.source}
                          </span>
                        )}
                      </div>
                      {l.status !== 'CONVERTED' && l.status !== 'ARCHIVED' && (
                        <div className="mt-2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => convert.mutate(l.id)}
                            className="inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
                          >
                            <ArrowRight className="h-3 w-3" /> Converter
                          </button>
                          <button
                            type="button"
                            onClick={() => archive.mutate(l.id)}
                            className="inline-flex items-center rounded bg-ink-100 px-2 py-0.5 text-[11px] font-semibold text-ink-600 hover:bg-ink-200"
                          >
                            Arquivar
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {openNew && <NewLeadModal onClose={() => setOpenNew(false)} />}
    </div>
  );
}

function NewLeadModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('');

  const m = useMutation({
    mutationFn: () =>
      leadsApi.create({ title, value: Number(value) || 0, source: source || undefined }),
    onSuccess: async () => {
      toast.success('Lead criado!');
      await qc.invalidateQueries({ queryKey: ['leads-all'] });
      await qc.invalidateQueries({ queryKey: ['leads-counters'] });
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error('Informe um título.');
    m.mutate();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow-elevated">
        <h3 className="text-lg font-bold text-ink-900">Novo lead</h3>
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
        <Input
          label="Valor estimado"
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Input
          label="Origem (source)"
          placeholder="Ex: Web Form, LinkedIn, Indicação"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={m.isPending}>
            Criar lead
          </Button>
        </div>
      </form>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  tagline,
  description,
  cta,
}: {
  icon: any;
  title: string;
  tagline: string;
  description: string;
  cta: string;
}) {
  return (
    <section className="rounded-xl border border-ink-200 bg-white p-8 shadow-card">
      <div className="grid place-items-center text-center">
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-brand-100 text-brand-700">
          <Icon className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold text-ink-900">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-brand-700">{tagline}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm text-ink-600">{description}</p>
        <div className="mt-6 flex gap-2">
          <Button>
            <Send className="h-4 w-4" /> {cta}
          </Button>
          <Button variant="outline">Saber mais</Button>
        </div>
      </div>
    </section>
  );
}
