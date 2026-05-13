# Frontend (app principal)

React 18 + Vite + TypeScript + Tailwind. Roda em `:5173`.

## Estrutura

```
frontend/src/
├── main.tsx                 # bootstrap (QueryClient, RouterProvider, Toaster)
├── router.tsx               # rotas (PrivateRoute, PublicOnlyRoute, AppOnlyRoute)
├── styles/index.css         # Tailwind + camadas custom
├── lib/{api,cn,query-client}.ts
├── store/auth.store.ts      # Zustand persistido (user + tokens)
├── api/{auth,onboarding}.api.ts
├── components/
│   ├── Logo.tsx
│   ├── ui/{Button,Input,Card,Spinner}.tsx
│   └── layout/{AppShell,Sidebar,Topbar,PageHeader}.tsx
├── pages/{LandingPage,NotFoundPage}.tsx
└── features/
    ├── auth/{components/AuthLayout, pages/{Login,Register,Verify2fa,Forgot,Reset}}
    ├── onboarding/{store/onboarding-draft, components/OnboardingShell,
    │              pages/{PersonalInfo,CompanyInfo,SetupTour}}
    ├── dashboard/pages/DashboardPage
    └── app/pages/{SetupGuide,Contacts,Placeholder}
```

## Identidade visual

Paleta `brand-*` em `tailwind.config.ts` (azul `#3b82f6`/`#2563eb`).
Fonte Inter. Cantos arredondados `lg` (`0.5rem`) ou `xl` (`0.875rem`).
Sombras: `card` (sutil) e `elevated` (modais/menus).

## Rotas

| Caminho                  | Acesso           | Componente              |
| ------------------------ | ---------------- | ----------------------- |
| `/`                      | Pública          | LandingPage             |
| `/login`                 | Public-only      | LoginPage               |
| `/register`              | Public-only      | RegisterPage            |
| `/verify-2fa`            | Public-only      | Verify2faPage           |
| `/forgot-password`       | Public-only      | ForgotPasswordPage      |
| `/reset-password?token=` | Public-only      | ResetPasswordPage       |
| `/onboarding/personal`   | Private          | PersonalInfoPage        |
| `/onboarding/company`    | Private          | CompanyInfoPage         |
| `/onboarding/setup-tour` | Private          | SetupTourPage           |
| `/dashboard` e demais    | AppOnly (com org)| AppShell + páginas      |

`AppOnlyRoute` redireciona para `/onboarding/personal` se o user
estiver autenticado mas não tiver `organizationId` (=ainda não fechou
o onboarding).

## Sidebar (Pipedrive-style)

Primário (sempre visível):

1. Guia de configuração (Compass)
2. Contatos (Users)
3. Atividades (CalendarCheck)
4. Negócios (Trophy)
5. Leads (Inbox)
6. Insights (BarChart3)
7. Caixa de e-mails (Mail)

Menu **Mais** expansível: Produtos, Projetos, Documentos, Campanhas,
Automações, Etiquetas, Plano e cobrança, Permissões, Central de ajuda,
Configurações.

## Auth + refresh

`lib/api.ts` injeta `Authorization: Bearer <accessToken>` em toda
request. Em 401, tenta renovar via `/auth/refresh` com singleflight
(uma promise compartilhada entre concorrentes) e retenta a request
original. Falhando, faz logout e redireciona via `PrivateRoute`.
