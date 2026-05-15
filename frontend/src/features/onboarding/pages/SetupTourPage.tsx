import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Users,
  Activity as ActivityIcon,
  Trophy,
  CheckCircle2,
  Star,
  ArrowLeft,
  ArrowRight,
  Phone,
  Building2,
  Calendar,
} from 'lucide-react';

import { OnboardingShell } from '../components/OnboardingShell';
import { Button } from '@/components/ui/Button';
import { useOnboardingDraft } from '../store/onboarding-draft.store';
import { onboardingApi } from '@/api/onboarding.api';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';

type Tab = 'contacts' | 'activities' | 'deals';

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: 'contacts', label: 'Contatos', icon: Users },
  { key: 'activities', label: 'Atividades', icon: ActivityIcon },
  { key: 'deals', label: 'Negócios', icon: Trophy },
];

const sampleContacts = [
  { name: 'Benjamin Leon', email: 'benjamin@moveer.com', phone: '+55 11 98765-4321', company: 'MoveEr' },
  { name: 'Tony Turner', email: 'tony@moveer.com', phone: '+55 11 91234-5678', company: 'MoveEr' },
];

const sampleActivities = [
  {
    type: 'Ligação',
    icon: Phone,
    title: 'Final attempt — Tony Turner',
    due: 'Amanhã · 10:00',
    deal: '[Sample] Tony Turner / MoveEr',
  },
  {
    type: 'Reunião',
    icon: Calendar,
    title: 'Context call — MoveEr',
    due: 'Em 2 dias · 14:30',
    deal: '[Sample] Tony Turner / MoveEr',
  },
];

const sampleStages = [
  { key: 'new', label: 'Novo deal' },
  { key: 'contact', label: 'Contato feito' },
  { key: 'qualified', label: 'Qualificado' },
  { key: 'meeting', label: 'Reunião concluída' },
  { key: 'negotiation', label: 'Negociação' },
  { key: 'signed', label: 'Fechado · ganho' },
];

const sampleDeal = {
  title: '[Sample] Tony Turner / MoveEr',
  value: 30000,
  currency: 'GBP',
  stage: 'contact',
};

export function SetupTourPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('contacts');
  const [showFeedback, setShowFeedback] = useState(false);
  const draft = useOnboardingDraft();
  const setUser = useAuthStore((s) => s.setUser);

  const currencyFmt = useMemo(
    () =>
      new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: sampleDeal.currency,
        maximumFractionDigits: 0,
      }),
    [],
  );

  const complete = useMutation({
    mutationFn: () =>
      onboardingApi.complete({
        personal: draft.personal,
        company: draft.company,
        feedbackScore: draft.feedbackScore ?? undefined,
      }),
    onSuccess: async () => {
      try {
        const me = await authApi.me();
        setUser(me);
      } catch {
        /* noop */
      }
      draft.reset();
      toast.success('Pronto! Bem-vindo ao oxlify.');
      navigate('/dashboard');
    },
    onError: (err) =>
      toast.error(extractErrorMessage(err, 'Falha ao concluir setup.')),
  });

  function finish() {
    setShowFeedback(true);
  }

  function submitFinal() {
    complete.mutate();
  }

  return (
    <OnboardingShell
      step={3}
      title="Tudo pronto. Veja o que já criamos para você."
      subtitle="Carregamos contatos, atividades e um deal de exemplo para você explorar."
    >
      <div className="rounded-xl border border-ink-200 bg-white shadow-card">
        <div className="flex border-b border-ink-200">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={
                  'flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ' +
                  (active
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-600 hover:text-ink-900')
                }
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {tab === 'contacts' && (
            <ul className="divide-y divide-ink-100">
              {sampleContacts.map((c) => (
                <li key={c.email} className="flex items-center gap-4 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 font-bold text-brand-700">
                    {c.name
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-ink-900">{c.name}</div>
                    <div className="text-sm text-ink-500">
                      {c.email} · {c.phone}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">
                    <Building2 className="h-3 w-3" /> {c.company}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'activities' && (
            <ul className="space-y-2">
              {sampleActivities.map((a) => (
                <li
                  key={a.title}
                  className="flex items-center gap-4 rounded-lg border border-ink-200 p-3"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-ink-900">{a.title}</div>
                    <div className="text-sm text-ink-500">
                      {a.due} · {a.deal}
                    </div>
                  </div>
                  <span className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                    {a.type}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'deals' && (
            <div className="grid grid-cols-3 gap-2">
              {sampleStages.slice(0, 3).map((s) => (
                <div key={s.key} className="rounded-lg bg-ink-50 p-2">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-500">
                    {s.label}
                  </div>
                  {s.key === sampleDeal.stage ? (
                    <div className="rounded-lg border border-ink-200 bg-white p-3 shadow-card">
                      <div className="font-semibold text-ink-900">{sampleDeal.title}</div>
                      <div className="mt-1 text-sm text-ink-500">MoveEr · Tony Turner</div>
                      <div className="mt-2 inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success">
                        {currencyFmt.format(sampleDeal.value)}
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 rounded-lg border border-dashed border-ink-200" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" /> Configuração inicial concluída
        </div>
        <p className="mt-1 text-success/80">
          Você pode editar, remover ou criar novos dados a qualquer momento dentro do app.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/onboarding/company')}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button type="button" size="lg" onClick={finish}>
          Entrar no app <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {showFeedback && (
        <FeedbackModal
          onSkip={submitFinal}
          onSubmit={(score) => {
            draft.setFeedbackScore(score);
            submitFinal();
          }}
          loading={complete.isPending}
        />
      )}
    </OnboardingShell>
  );
}

function FeedbackModal({
  onSkip,
  onSubmit,
  loading,
}: {
  onSkip: () => void;
  onSubmit: (score: number) => void;
  loading: boolean;
}) {
  const [score, setScore] = useState<number | null>(null);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-elevated">
        <h3 className="text-lg font-bold text-ink-900">
          Como foi sua configuração inicial?
        </h3>
        <p className="mt-1 text-sm text-ink-600">
          Seu feedback nos ajuda a melhorar.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              className="rounded-full p-1 transition-transform hover:scale-110"
              aria-label={`Nota ${n}`}
            >
              <Star
                className={
                  'h-8 w-8 ' +
                  ((score ?? 0) >= n
                    ? 'fill-warning text-warning'
                    : 'text-ink-300')
                }
              />
            </button>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onSkip} disabled={loading}>
            Pular
          </Button>
          <Button
            disabled={!score}
            loading={loading}
            onClick={() => onSubmit(score!)}
          >
            Enviar e continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
