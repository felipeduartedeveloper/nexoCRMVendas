import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Mail, Plus, Trash2, X } from 'lucide-react';
import { marketingApi, type EmailTemplate } from '@/api/marketing.api';

export function TemplatesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EmailTemplate | 'new' | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['marketing', 'templates'],
    queryFn: marketingApi.listTemplates,
  });

  const duplicateMut = useMutation({
    mutationFn: (id: string) => marketingApi.duplicateTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'templates'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => marketingApi.deleteTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing', 'templates'] }),
  });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Modelos de email</h1>
          <p className="text-sm text-muted-foreground">
            Reutilize designs e textos prontos com merge fields {`{{contact.firstName}}`}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Novo modelo
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && data.length === 0 && (
          <div className="grid place-items-center p-16 text-center">
            <Mail className="h-12 w-12 text-muted-foreground/50" />
            <h2 className="mt-3 text-base font-semibold text-foreground">Sem modelos ainda</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie modelos reutilizáveis pra agilizar suas campanhas.
            </p>
          </div>
        )}
        {!isLoading && data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-elevated"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">{t.name}</h3>
                    {t.category && (
                      <span className="mt-1 inline-block rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t.category}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{t.subject}</p>
                <div
                  className="mt-3 line-clamp-3 max-h-16 overflow-hidden rounded-md bg-muted/40 p-2 text-xs text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: t.bodyHtml.slice(0, 200) }}
                />
                <div className="mt-3 flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => duplicateMut.mutate(t.id)}
                    title="Duplicar"
                    className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-muted/40"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Apagar modelo?')) deleteMut.mutate(t.id);
                    }}
                    title="Apagar"
                    className="grid h-7 w-7 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && <TemplateEditor template={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function TemplateEditor({
  template,
  onClose,
}: {
  template: EmailTemplate | 'new';
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isNew = template === 'new';
  const t = isNew ? null : template;
  const [name, setName] = useState(t?.name ?? '');
  const [subject, setSubject] = useState(t?.subject ?? '');
  const [category, setCategory] = useState(t?.category ?? '');
  const [bodyHtml, setBodyHtml] = useState(t?.bodyHtml ?? '<p>Olá {{contact.firstName}},</p>');

  const mut = useMutation({
    mutationFn: () => {
      const payload = { name, subject, category: category || undefined, bodyHtml };
      return isNew
        ? marketingApi.createTemplate(payload)
        : marketingApi.updateTemplate(t!.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['marketing', 'templates'] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-xl bg-card shadow-elevated">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-lg font-bold text-foreground">
            {isNew ? 'Novo modelo' : 'Editar modelo'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-hidden p-5">
          <div className="flex flex-col gap-3 overflow-y-auto">
            <label className="block">
              <span className="field-label">Nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-md border border-border px-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="field-label">Assunto</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 w-full rounded-md border border-border px-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="field-label">Categoria</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Promo, Onboarding, Newsletter..."
                className="h-9 w-full rounded-md border border-border px-2 text-sm"
              />
            </label>
            <label className="block flex-1">
              <span className="field-label">HTML</span>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={16}
                className="h-full w-full rounded-md border border-border px-2 py-1.5 font-mono text-xs"
              />
            </label>
          </div>
          <div className="overflow-auto rounded-md border border-border bg-card p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Preview</p>
            <div className="rounded border border-border/50 p-3">
              <p className="mb-2 text-sm font-semibold text-foreground">{subject || '(sem assunto)'}</p>
              <div className="text-sm" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            </div>
          </div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground/80 hover:bg-muted/40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => mut.mutate()}
            disabled={mut.isPending || !name.trim()}
            className="h-9 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {mut.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </footer>
      </div>
    </div>
  );
}
