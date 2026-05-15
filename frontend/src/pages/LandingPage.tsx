import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Users,
  Target,
  BarChart3,
  Inbox,
  Sparkles,
  Zap,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Target,
    title: 'Pipeline visual',
    desc: 'Arraste deals entre estágios e veja tudo o que importa em um único Kanban.',
  },
  {
    icon: PhoneCall,
    title: 'Atividades centralizadas',
    desc: 'Ligações, reuniões, tarefas e e-mails em uma única timeline por contato.',
  },
  {
    icon: Inbox,
    title: 'Sales Inbox',
    desc: 'Conecte seu e-mail e registre conversas automaticamente nos negócios.',
  },
  {
    icon: BarChart3,
    title: 'Insights e relatórios',
    desc: 'Acompanhe receita, conversão por estágio e desempenho do time em tempo real.',
  },
  {
    icon: Users,
    title: 'Contatos e empresas',
    desc: 'Cadastre pessoas e empresas com histórico completo de interações.',
  },
  {
    icon: Sparkles,
    title: 'Automações inteligentes',
    desc: 'Crie regras para mover deals, atribuir donos e enviar e-mails de follow-up.',
  },
];

const plans = [
  {
    name: 'Essential',
    price: 'R$ 49',
    desc: 'Para começar a organizar seu funil.',
    features: ['Pipeline ilimitado', 'Até 3 usuários', 'Importação CSV/XLSX', 'Histórico de contatos'],
  },
  {
    name: 'Advanced',
    price: 'R$ 89',
    desc: 'Para times que querem escalar.',
    features: ['Sales Inbox', 'Automações básicas', 'Até 10 usuários', 'Relatórios avançados'],
    highlight: true,
  },
  {
    name: 'Professional',
    price: 'R$ 149',
    desc: 'Para times de alta performance.',
    features: ['Automações avançadas', 'Usuários ilimitados', 'API REST', 'Suporte prioritário'],
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/80 backdrop-blur">
        <div className="container-wide flex h-16 items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-700 md:flex">
            <a href="#features" className="hover:text-brand-600">Recursos</a>
            <a href="#why" className="hover:text-brand-600">Por que oxlify</a>
            <a href="#pricing" className="hover:text-brand-600">Planos</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden text-sm font-semibold text-ink-700 hover:text-brand-600 sm:block"
            >
              Entrar
            </Link>
            <Link to="/register">
              <Button size="md">
                Teste grátis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-ink-50"
        />
        <div className="container-wide grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
              <Zap className="h-3.5 w-3.5" /> Pipeline-driven CRM
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink-900 md:text-5xl">
              O CRM que <span className="text-brand-600">faz seu time</span> fechar mais negócios.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-600 text-balance">
              Organize seu funil, automatize follow-ups e veja o time inteiro avançando.
              Tudo o que o Pipedrive entrega, agora pensado para o time brasileiro.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg">
                  Começar grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Já sou cliente
                </Button>
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> 14 dias grátis
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Sem cartão
              </li>
              <li className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Cancele quando quiser
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="rounded-2xl border border-ink-200 bg-white p-3 shadow-elevated">
              <div className="flex h-6 items-center gap-1.5 border-b border-ink-100 px-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <div className="grid grid-cols-4 gap-2 p-3">
                {['Novo', 'Contato', 'Qualificado', 'Negociação'].map((stage, i) => (
                  <div key={stage} className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-ink-500">
                      {stage}
                    </div>
                    {[1, 2].map((c) => (
                      <div
                        key={c}
                        className="rounded-lg border border-ink-200 bg-white p-2 shadow-card"
                      >
                        <div className="h-2 w-3/4 rounded bg-ink-200" />
                        <div className="mt-1.5 h-2 w-1/2 rounded bg-ink-100" />
                        <div className="mt-2 inline-flex h-5 items-center rounded-full bg-brand-50 px-2 text-[10px] font-semibold text-brand-700">
                          R$ {((i + 1) * 12 + c * 3).toLocaleString('pt-BR')}.000
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 rounded-full bg-brand-200/60 blur-3xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-ink-100 py-20">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              Tudo o que o time comercial precisa.
            </h2>
            <p className="mt-3 text-ink-600">
              Da prospecção ao fechamento — em uma interface limpa, rápida e pensada para vendedores.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-ink-200 bg-white p-6 shadow-card transition-shadow hover:shadow-elevated"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-ink-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="bg-ink-50 py-20">
        <div className="container-wide grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              Construído com a estrutura que vendedores amam.
            </h2>
            <p className="mt-3 text-ink-600">
              Inspirado no que o Pipedrive consagrou, com tudo o que faltava: idioma 100% pt-BR,
              suporte local, faturamento em real e integração nativa com WhatsApp.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-700">
              {[
                'Pipeline com drag-and-drop nativo',
                'E-mails de follow-up automáticos',
                'Importação de CSV/XLSX em minutos',
                'Permissões por papel (RBAC)',
                'API REST + WebSockets em tempo real',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
            <p className="text-2xl font-bold leading-snug text-ink-900">
              "Em 30 dias o time de vendas triplicou a quantidade de deals fechados.
              O oxlify é simples como uma planilha — e poderoso como um sistema de
              verdade."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand-200" />
              <div>
                <div className="font-semibold text-ink-900">Carolina Mendes</div>
                <div className="text-sm text-ink-500">Head of Sales, Acme Tech</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              Planos para todos os tamanhos.
            </h2>
            <p className="mt-3 text-ink-600">
              Comece grátis. Escale quando precisar.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={
                  'flex flex-col rounded-xl border bg-white p-7 shadow-card ' +
                  (p.highlight
                    ? 'border-brand-500 ring-2 ring-brand-100'
                    : 'border-ink-200')
                }
              >
                {p.highlight && (
                  <span className="self-start rounded-full bg-brand-500 px-3 py-0.5 text-xs font-semibold text-white">
                    Mais popular
                  </span>
                )}
                <h3 className="mt-3 text-xl font-bold text-ink-900">{p.name}</h3>
                <p className="text-sm text-ink-600">{p.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-ink-900">{p.price}</span>
                  <span className="text-sm text-ink-500">/ usuário / mês</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-ink-700">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="mt-auto pt-6">
                  <Button fullWidth variant={p.highlight ? 'primary' : 'outline'}>
                    Começar com {p.name}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Pronto para vender mais?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            14 dias grátis. Sem cartão. Configuração em menos de 5 minutos.
          </p>
          <div className="mt-7">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Criar minha conta grátis <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-200 bg-white py-10">
        <div className="container-wide flex flex-col items-center justify-between gap-4 text-sm text-ink-500 md:flex-row">
          <Logo />
          <p>© 2026 oxlify. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
