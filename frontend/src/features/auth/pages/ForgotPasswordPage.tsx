import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/api/auth.api';
import { extractErrorMessage } from '@/lib/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const m = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => setSent(true),
    onError: (err) =>
      toast.error(extractErrorMessage(err, 'Não foi possível enviar o link.')),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    m.mutate(email);
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      subtitle="Informe seu e-mail e enviaremos um link para redefinir sua senha."
      footer={
        <Link to="/login" className="text-brand-600 hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-brand-50 p-3 text-brand-600">
            <Mail className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm text-ink-700">
            Se este e-mail estiver cadastrado, você receberá um link em instantes.
            Verifique também sua caixa de spam.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@empresa.com"
            leftSlot={<Mail className="h-4 w-4" aria-hidden />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={m.isPending}>
            Enviar link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
