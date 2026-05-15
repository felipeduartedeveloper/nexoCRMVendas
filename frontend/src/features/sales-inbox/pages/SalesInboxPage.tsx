import { useState } from 'react';
import {
  Inbox,
  FileEdit,
  Send,
  Archive,
  PenSquare,
  Mail,
  Shield,
  Sparkles,
  Users,
  Lock,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  Zap,
  Trophy,
} from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/cn';

type Folder = 'inbox' | 'drafts' | 'outbox' | 'sent' | 'archive';

const FOLDERS: { value: Folder; label: string; icon: any }[] = [
  { value: 'inbox', label: 'Inbox', icon: Inbox },
  { value: 'drafts', label: 'Drafts', icon: FileEdit },
  { value: 'outbox', label: 'Outbox', icon: Mail },
  { value: 'sent', label: 'Sent', icon: Send },
  { value: 'archive', label: 'Archive', icon: Archive },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Powerful features',
    desc: 'Link emails to deals and leads. Send emails in bulk, track opens and clicks, set up templates.',
  },
  {
    icon: Zap,
    title: 'Enhanced tools',
    desc: 'Write and summarize conversations using AI.',
  },
  {
    icon: Users,
    title: 'Team Inbox',
    desc: 'Add team members to collaborate in the same inbox. Assign emails for better collaboration.',
  },
  {
    icon: Lock,
    title: 'Secure and private',
    desc: 'You decide who can see your emails. Your data is safe with us.',
  },
];

const STATS = [
  { value: '3.4x', label: 'Add 3.4x more deals' },
  { value: '20%', label: 'Close deals 20% faster' },
  { value: '23%', label: 'Win 23% more deals' },
];

const FAQS = [
  {
    q: 'How does two-way email sync work?',
    a: 'Após ativar, conversas são sincronizadas nos dois sentidos. Você pode usar a Sales Inbox ou seu provedor (Gmail/Outlook) — as mensagens aparecem em ambos.',
  },
  {
    q: 'Can I control which emails are private or shared with my team?',
    a: 'Sim. Por padrão suas conversas são privadas. Você pode marcar threads específicos como compartilhados com o time, ou liberar tudo se quiser uma caixa colaborativa.',
  },
  {
    q: 'How does oxlify handle email security?',
    a: 'Usamos OAuth (sem armazenar senhas), criptografia em trânsito e repouso, e auditoria de acesso. SUPER_ADMIN pode revogar tokens individualmente.',
  },
  {
    q: 'Do my emails automatically link with contacts, deals and leads?',
    a: 'Sim. Por endereço de e-mail do destinatário/remetente, vinculamos automaticamente a contatos e seus deals/leads.',
  },
];

export function SalesInboxPage() {
  const user = useAuthStore((s) => s.user);
  const [folder, setFolder] = useState<Folder>('inbox');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Sales Inbox"
        subtitle="Close deals faster with better email. Smart, secure, configurable."
        actions={
          <Button>
            <PenSquare className="h-4 w-4" /> New email
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-ink-200 bg-white p-3 shadow-card">
          <div className="mb-3 rounded-lg border border-brand-200 bg-brand-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-brand-700">
              Conta conectada
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-ink-900">
              {user?.email ?? 'não conectada'}
            </div>
            <div className="mt-1 text-xs text-ink-500">
              Incluído no seu plano <strong>Premium</strong>.
            </div>
          </div>
          <ul className="space-y-0.5">
            {FOLDERS.map((f) => (
              <li key={f.value}>
                <button
                  type="button"
                  onClick={() => setFolder(f.value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    folder === f.value
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-700 hover:bg-ink-100',
                  )}
                >
                  <f.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{f.label}</span>
                  <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-bold text-ink-500">
                    0
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-xl border border-ink-200 bg-white p-8 text-center shadow-card">
          <span className="grid h-12 w-12 mx-auto place-items-center rounded-lg bg-brand-100 text-brand-700">
            <Mail className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-xl font-extrabold text-ink-900">
            Conecte sua caixa de e-mails
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
            Sincronize Gmail ou Outlook em dois cliques. Suas conversas vão aparecer
            vinculadas a contatos e deals automaticamente.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg">
              <Mail className="h-4 w-4" /> Conectar Gmail
            </Button>
            <Button size="lg" variant="outline">
              <Mail className="h-4 w-4" /> Conectar Outlook
            </Button>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-500">
            <Shield className="h-3.5 w-3.5" /> OAuth seguro. Não armazenamos senhas.
          </div>
        </section>
      </div>

      <section className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-ink-200 bg-white p-5 shadow-card"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <f.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-base font-bold text-ink-900">{f.title}</h3>
            <p className="mt-1 text-sm text-ink-600">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {STATS.map((s, idx) => (
          <div
            key={s.value}
            className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50/40 p-5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white">
              {idx === 0 && <TrendingUp className="h-6 w-6" />}
              {idx === 1 && <Zap className="h-6 w-6" />}
              {idx === 2 && <Trophy className="h-6 w-6" />}
            </span>
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-brand-700">
                {s.value}
              </div>
              <div className="text-xs font-semibold text-ink-700">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-ink-200 bg-white p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-ink-900">Frequently asked questions</h2>
        <ul className="divide-y divide-ink-100">
          {FAQS.map((f, idx) => {
            const open = openFaq === idx;
            return (
              <li key={f.q} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : idx)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="font-semibold text-ink-900">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-ink-500 transition-transform',
                      open && 'rotate-180',
                    )}
                  />
                </button>
                {open && <p className="mt-2 text-sm text-ink-600">{f.a}</p>}
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center gap-2 text-xs text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Saiba mais em <a href="#" className="underline">/help/sales-inbox</a>
        </div>
      </section>
    </div>
  );
}
