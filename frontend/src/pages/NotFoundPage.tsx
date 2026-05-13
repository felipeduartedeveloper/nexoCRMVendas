import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-white px-4 text-center">
      <div>
        <Logo className="mx-auto" />
        <h1 className="mt-6 text-6xl font-extrabold tracking-tight text-brand-600">404</h1>
        <p className="mt-3 text-lg text-ink-700">Página não encontrada.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Voltar para o início</Button>
        </Link>
      </div>
    </div>
  );
}
