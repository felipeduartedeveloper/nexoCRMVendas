import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Mail, Phone, Briefcase, StickyNote, Activity as ActivityIcon } from 'lucide-react';

import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { contactsApi } from '@/api/contacts.api';
import { activitiesApi } from '@/api/activities.api';
import { extractErrorMessage } from '@/lib/api';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

type Tab = 'overview' | 'activities' | 'notes';

interface Props {
  open: boolean;
  contactId: string | null;
  onClose: () => void;
}

export function ContactDetailDrawer({ open, contactId, onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');

  const q = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => contactsApi.one(contactId!),
    enabled: open && !!contactId,
  });

  const activitiesQ = useQuery({
    queryKey: ['contact-activities', contactId],
    queryFn: () => activitiesApi.list({ contactId: contactId!, limit: 50 }),
    enabled: open && !!contactId && tab === 'activities',
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (q.data) {
      setName(q.data.name);
      setEmail(q.data.email ?? '');
      setPhone(q.data.phone ?? '');
      setJobTitle(q.data.jobTitle ?? '');
    }
  }, [q.data?.id]);

  const update = useMutation({
    mutationFn: (data: any) => contactsApi.update(contactId!, data),
    onSuccess: async () => {
      toast.success('Salvo!');
      await qc.invalidateQueries({ queryKey: ['contact', contactId] });
      await qc.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: () => contactsApi.remove(contactId!),
    onSuccess: async () => {
      toast.success('Contato removido.');
      onClose();
      await qc.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const c = q.data;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title={
        c ? (
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {initials(c.name)}
            </span>
            <span className="truncate text-lg font-bold text-ink-900">{c.name}</span>
          </div>
        ) : (
          'Carregando…'
        )
      }
      subtitle={c?.jobTitle && <span>{c.jobTitle}</span>}
      headerActions={
        c && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Apagar este contato?')) remove.mutate();
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-danger hover:bg-red-50"
            aria-label="Apagar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )
      }
    >
      {!c ? (
        <div className="p-8 text-center text-sm text-ink-500">Carregando…</div>
      ) : (
        <div>
          <nav className="flex border-b border-ink-200" role="tablist">
            {[
              { value: 'overview' as Tab, label: 'Visão geral' },
              { value: 'activities' as Tab, label: 'Atividades' },
              { value: 'notes' as Tab, label: 'Notas' },
            ].map((t) => (
              <button
                key={t.value}
                role="tab"
                onClick={() => setTab(t.value)}
                className={cn(
                  'flex-1 border-b-2 px-4 py-3 text-sm font-semibold transition-colors',
                  tab === t.value
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-600 hover:text-ink-900',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'overview' && (
            <div className="space-y-4 p-5">
              <Input
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => name !== c.name && name && update.mutate({ name })}
              />
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() =>
                  (email || null) !== (c.email || null) && update.mutate({ email: email || null })
                }
                leftSlot={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() =>
                  (phone || null) !== (c.phone || null) && update.mutate({ phone: phone || null })
                }
                leftSlot={<Phone className="h-4 w-4" />}
              />
              <Input
                label="Cargo"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                onBlur={() =>
                  (jobTitle || null) !== (c.jobTitle || null) &&
                  update.mutate({ jobTitle: jobTitle || null })
                }
                leftSlot={<Briefcase className="h-4 w-4" />}
              />
              <div className="grid grid-cols-2 gap-3 text-xs text-ink-500">
                <div>Criado em {new Date(c.createdAt).toLocaleString('pt-BR')}</div>
                <div>Atualizado em {new Date(c.updatedAt).toLocaleString('pt-BR')}</div>
              </div>
            </div>
          )}

          {tab === 'activities' && (
            <div className="p-5">
              {activitiesQ.isLoading ? (
                <div className="text-sm text-ink-500">Carregando atividades…</div>
              ) : !activitiesQ.data?.items?.length ? (
                <div className="grid place-items-center py-10 text-center">
                  <ActivityIcon className="h-8 w-8 text-ink-300" />
                  <p className="mt-2 text-sm font-semibold text-ink-900">Sem atividades</p>
                  <p className="text-xs text-ink-500">
                    Crie atividades relacionadas a este contato.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {activitiesQ.data.items.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-lg border border-ink-200 p-3 text-sm"
                    >
                      <div
                        className={cn(
                          'font-semibold text-ink-900',
                          a.done && 'text-ink-400 line-through',
                        )}
                      >
                        {a.subject}
                      </div>
                      <div className="text-xs text-ink-500">
                        {a.dueAt ? new Date(a.dueAt).toLocaleString('pt-BR') : 'sem prazo'} ·{' '}
                        {a.type}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'notes' && (
            <div className="grid place-items-center p-10 text-center">
              <StickyNote className="h-8 w-8 text-ink-300" />
              <p className="mt-2 text-sm font-semibold text-ink-900">Notas em breve</p>
              <p className="text-xs text-ink-500">
                Histórico de anotações livres por contato chega no próximo sprint.
              </p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
