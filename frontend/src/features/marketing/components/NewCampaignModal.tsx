import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { marketingApi } from '@/api/marketing.api';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewCampaignModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [bodyHtml, setBodyHtml] = useState('');
  const [audienceId, setAudienceId] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['marketing', 'templates'],
    queryFn: marketingApi.listTemplates,
    enabled: open && step === 2,
  });

  const { data: audiences = [] } = useQuery({
    queryKey: ['marketing', 'audiences'],
    queryFn: marketingApi.listAudiences,
    enabled: open && step === 3,
  });

  const mut = useMutation({
    mutationFn: () =>
      marketingApi.createCampaign({
        name: name.trim(),
        subject: subject.trim(),
        fromName: fromName.trim(),
        fromEmail: fromEmail.trim(),
        replyToEmail: replyToEmail.trim() || null,
        templateId,
        audienceId,
        scheduledAt: scheduledAt || null,
        bodyHtml: bodyHtml || templates.find((t) => t.id === templateId)?.bodyHtml || '',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketing', 'campaigns'] });
      reset();
      onClose();
    },
    onError: (err) => setError(extractErrorMessage(err)),
  });

  function reset() {
    setStep(1);
    setName('');
    setSubject('');
    setFromName('');
    setFromEmail('');
    setReplyToEmail('');
    setTemplateId(null);
    setBodyHtml('');
    setAudienceId(null);
    setScheduledAt('');
    setError(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }
    mut.mutate();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-xl bg-card shadow-elevated">
        <header className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Nova campanha</h2>
            <p className="text-xs text-muted-foreground">Passo {step} de 3</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5">
          {step === 1 && (
            <>
              <label className="block">
                <span className="field-label">Nome da campanha *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="field-label">Assunto do email *</span>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="field-label">Nome do remetente *</span>
                  <input
                    required
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="h-9 w-full rounded-md border border-border px-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="field-label">Email do remetente *</span>
                  <input
                    required
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="h-9 w-full rounded-md border border-border px-2 text-sm"
                  />
                </label>
              </div>
              <label className="block">
                <span className="field-label">Reply-To (opcional)</span>
                <input
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
              </label>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-muted-foreground">Escolha um modelo ou crie um email em branco:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTemplateId(null)}
                  className={`rounded-md border-2 p-3 text-left text-sm ${
                    templateId === null ? 'border-brand-500 bg-brand-50' : 'border-border'
                  }`}
                >
                  <strong>Email em branco</strong>
                  <p className="mt-1 text-xs text-muted-foreground">Começar do zero</p>
                </button>
                {templates.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`rounded-md border-2 p-3 text-left text-sm ${
                      templateId === t.id ? 'border-brand-500 bg-brand-50' : 'border-border'
                    }`}
                  >
                    <strong>{t.name}</strong>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{t.subject}</p>
                  </button>
                ))}
              </div>
              {templateId === null && (
                <label className="block">
                  <span className="field-label">HTML do email</span>
                  <textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    rows={6}
                    placeholder="<p>Olá {{contact.firstName}}...</p>"
                    className="w-full rounded-md border border-border px-2 py-1.5 font-mono text-xs"
                  />
                </label>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <label className="block">
                <span className="field-label">Audiência</span>
                <select
                  value={audienceId ?? ''}
                  onChange={(e) => setAudienceId(e.target.value || null)}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                >
                  <option value="">— Selecione —</option>
                  {audiences.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.estimatedSize} contato{a.estimatedSize !== 1 ? 's' : ''})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="field-label">Agendamento</span>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="h-9 w-full rounded-md border border-border px-2 text-sm"
                />
                <p className="field-hint">Deixe em branco para criar como rascunho.</p>
              </label>
            </>
          )}

          {error && (
            <div className="rounded-md border border-danger/30 bg-danger/5 p-2 text-sm text-danger">
              {error}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-border p-4">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose())}
            className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40"
          >
            {step > 1 ? 'Voltar' : 'Cancelar'}
          </button>
          <button
            type="submit"
            disabled={mut.isPending}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {step < 3 ? 'Próximo' : mut.isPending ? 'Criando...' : 'Criar campanha'}
          </button>
        </footer>
      </form>
    </div>
  );
}
