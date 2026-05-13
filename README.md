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

Sprint 1 — **fundação + auth + onboarding** ✅ em construção.

Roadmap próximo: CRUDs completos (Contacts, Activities, Deals), Kanban DnD, Pipelines/Stages config, Realtime WebSocket, Reports, Email integration, Automations.
