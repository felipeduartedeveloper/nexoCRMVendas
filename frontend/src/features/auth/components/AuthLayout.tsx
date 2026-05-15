import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

interface Props {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-background to-muted dark:from-background dark:via-background dark:to-muted">
      <header className="container-wide flex items-center justify-between py-6">
        <Link to="/" className="inline-flex items-center">
          <Logo />
        </Link>
        <Link
          to="/login"
          className="text-sm font-medium text-foreground/80 hover:text-brand-600"
        >
          Já tem conta? <span className="text-brand-600">Entrar</span>
        </Link>
      </header>
      <main className="container-wide grid place-items-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-card p-7 shadow-card">
            {children}
          </div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}
