import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { contactsApi } from '@/api/contacts.api';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NewContactModal({ open, onClose }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const m = useMutation({
    mutationFn: () =>
      contactsApi.create({
        name,
        email: email || undefined,
        phone: phone || undefined,
        jobTitle: jobTitle || undefined,
      }),
    onSuccess: async () => {
      toast.success('Contato criado!');
      await qc.invalidateQueries({ queryKey: ['contacts'] });
      reset();
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Falha ao criar.')),
  });

  function reset() {
    setName('');
    setEmail('');
    setPhone('');
    setJobTitle('');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Informe o nome.');
      return;
    }
    m.mutate();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-lg font-bold text-foreground">Novo contato</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          <Input
            label="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            label="Cargo"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={m.isPending}>
              Cancelar
            </Button>
            <Button type="submit" loading={m.isPending}>
              Criar contato
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
