# crmvendas

Clone funcional do **pipedrive.com** — CRM pipeline-driven com onboarding guiado, kanban de deals, contatos, atividades e dashboard.

Construído com a mesma arquitetura e design system do **Nexo CRM** (`crmModerno`), porém com domínio focado em **vendas pipeline-driven** ao invés de CRM genérico.

---

## Stack

| Camada      | Tecnologias                                                                  |
| ----------- | ---------------------------------------------------------------------------- |
| **Backend** | NestJS 10 · Bun · TypeORM · Postgres 16 · Redis 7 · JWT · Socket.io · Swagger |
| **Frontend**| React 18 · Vite · TypeScript · TanStack Query · Zustand · Tailwind · lucide   |
| **Admin**   | Mesma stack do frontend (porta 5174, paleta laranja, login restrito)         |
| **Infra**   | Docker Compose · MinIO (S3) · Nginx (reverse proxy)                          |

7 containers: `postgres · redis · minio · backend · frontend · admin · nginx`.

---

## Quick start

```bash
# 1. Copiar .env
cp .env.example .env

# 2. Subir tudo
docker compose up -d --build

# 3. Acessar
# Frontend (usuário):  http://localhost:5173
# Admin (super-admin): http://localhost:5174
# API + Swagger:       http://localhost:3000/docs
# MinIO console:       http://localhost:9001
# Nginx (proxy):       http://localhost:8081
```

Bootstrap padrão:
- **Super-admin:** `admin@crmvendas.local` / `Admin@123` → login no admin (`:5174`)

Crie sua conta normalmente pelo frontend (`:5173`) — `Try free` na landing.

---

## Produção (Oxlify Sales)

Backend em Docker nesta VPS exposto via **Cloudflare Tunnel**; frontend e admin na **Vercel**.

| Ambiente | URL |
| -------- | --- |
| **Frontend (CRM)** | https://sales.oxlify.com |
| **Admin (SaaS Console)** | https://sales-admin.oxlify.com |
| **API (backend/túnel)** | https://sales-api.oxlify.com |

### Acessos de teste

| Painel | Login | Senha | Papel |
| ------ | ----- | ----- | ----- |
| **sales** (CRM) | `demo@oxlify.com` | `Vendas@123` | ADMIN (org criada) |
| **sales-admin** (console) | `admin@crmvendas.local` | `Admin@123` | SUPER_ADMIN |

> ⚠️ **Credenciais de desenvolvimento/teste — troque em produção real.** Este repositório é público.

### Segurança no login

- **Cloudflare Turnstile (captcha)** exigido no login do `sales` e do `sales-admin` (env `VITE_TURNSTILE_SITE_KEY` no front/admin, `TURNSTILE_SECRET_KEY` no backend).
- **2FA TOTP** (Google Authenticator / Authy / 1Password):
  - **sales-admin:** obrigatório — no 1º login o SUPER_ADMIN é forçado a configurar (QR). Sem opção de desativar pela UI.
  - **sales:** opcional — o usuário ativa/desativa em **Configurações → Security center**.
- Reset de 2FA do admin (se perder o autenticador), via banco:
  ```bash
  docker exec crmvendas-postgres-1 psql -U crmvendas -d crmvendas_db \
    -c "UPDATE users SET \"totpEnabled\"=false, \"totpSecret\"=NULL WHERE email='admin@crmvendas.local';"
  ```

---

## Estrutura

```
crmvendas/
├── backend/                NestJS API
│   └── src/modules/        auth · users · organizations · contacts ·
│                           activities · deals · pipelines · stages ·
│                           onboarding · mail · realtime · uploads · roles
├── frontend/               React app usuário (5173, paleta azul)
│   └── src/pages/          landing · auth · onboarding · setup · dashboard
├── admin/                  React app super-admin (5174, paleta laranja)
├── docker/                 init.sql · nginx.conf
├── docs/                   ARCHITECTURE · BACKEND · FRONTEND · ADMIN ·
│                           DATABASE · API · ONBOARDING · DOCKER
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Fluxo de onboarding (Pipedrive-like)

1. Landing → **Try free**
2. Signup (email/senha)
3. Verificação **2FA por email** (código 6 dígitos)
4. Questionário pessoal (nome, telefone)
5. Questionário da empresa (nome, ramo, número de funcionários, papel)
6. **Setup tour** com 3 abas:
   - **Contacts** — tabela read-only com sample data
   - **Activities** — tabela de atividades pré-criadas
   - **Deals** — Kanban "Sales pipeline tailored for your industry" (6 colunas)
7. Modal de feedback `How easy was the setup?` (Difficult ↔ Easy)
8. Dashboard com pipeline real do usuário

Detalhes em [`docs/ONBOARDING.md`](docs/ONBOARDING.md).

---

## Documentação

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — visão geral, decisões
- [`docs/BACKEND.md`](docs/BACKEND.md) — módulos, services, auth flow
- [`docs/FRONTEND.md`](docs/FRONTEND.md) — rotas, design tokens, padrões
- [`docs/ADMIN.md`](docs/ADMIN.md) — painel super-admin
- [`docs/DATABASE.md`](docs/DATABASE.md) — ERD, entidades, índices
- [`docs/API.md`](docs/API.md) — endpoints REST
- [`docs/ONBOARDING.md`](docs/ONBOARDING.md) — flow detalhado
- [`docs/DOCKER.md`](docs/DOCKER.md) — orquestração, troubleshooting

---

## Status

**Sprint 1 — fundação completa.** Inclui:

- Backend NestJS com todos os módulos (auth/2FA/refresh, users, organizations, onboarding seedando sample data, contacts, activities, deals, pipelines, leads)
- Frontend completo: landing page, auth (login + register + verify 2FA + forgot + reset), onboarding wizard 3 etapas, dashboard, setup guide com goal cards, contacts, AppShell Pipedrive-style
- Admin SaaS Console: login restrito a SUPER_ADMIN, dashboard de KPIs agregados, lista de usuários
- Docker Compose com 7 containers + Nginx reverse proxy
- 8 docs em `docs/` cobrindo arquitetura, backend, frontend, admin, banco, API, onboarding e Docker

### Próximos sprints

- **Sprint 2** — Painel Settings da empresa (admin user) Pipedrive-style; CRUDs completos de contacts/activities/deals; Kanban DnD; pipelines configuráveis pelo ADMIN; Realtime WebSocket (typing, presença, novas activities).
- **Sprint 3** — Painel SUPER_ADMIN SaaS completo (organizations, plans, audit log, e-mails enviados, segurança); migrations TypeORM; Email integration (Gmail OAuth); Insights/Reports.
- **Sprint 4** — Automations (regras: mover deal, atribuir owner, enviar e-mail), import CSV/XLSX, billing Stripe.
