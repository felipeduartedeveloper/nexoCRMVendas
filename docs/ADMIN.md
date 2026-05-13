# Admin (SaaS Console)

Painel administrativo da plataforma. Mesma stack do frontend, paleta
laranja `#f97316`, porta `:5174`. **Somente SUPER_ADMIN entra.**

## Diferenças vs frontend

| Item        | Frontend                            | Admin                                  |
| ----------- | ----------------------------------- | -------------------------------------- |
| Cor primária| `brand-500` azul `#3b82f6`          | `brand-500` laranja `#f97316`          |
| Porta dev   | 5173                                | 5174                                   |
| Acesso      | Qualquer usuário autenticado        | Somente `user.role === 'SUPER_ADMIN'`  |
| Login       | E-mail + senha + 2FA + onboarding   | E-mail + senha (sem onboarding, sem 2FA forçado) |
| Tem onboarding? | Sim (wizard 3 passos)            | Não                                    |

## Sidebar

1. Visão geral (dashboard plataforma)
2. Organizações (CRUD multi-tenant)
3. Usuários (todos os usuários cadastrados)
4. Planos
5. Trilha de auditoria
6. E-mails enviados
7. Segurança
8. Configurações

## Telas implementadas (v0.1)

- LoginPage — bloqueia papéis que não são SUPER_ADMIN
- DashboardPage — 4 KPIs (orgs, users, deals, MRR)
- UsersPage — tabela com nome, e-mail, papel (badge colorida), org,
  status (Ativo/Inativo)
- 6 demais rotas usando `PlaceholderPage` para o Sprint 2.

## Como entrar

1. Suba o backend (`docker compose up backend postgres redis`)
2. O `UsersService.onModuleInit` cria o SUPER_ADMIN automaticamente:
   - `admin@crmvendas.local` / `Admin@123`
3. Acesse `http://localhost:5174` e entre.
4. Se a tela mostrar "Acesso restrito ao console SaaS", o login funcionou
   mas o papel não é SUPER_ADMIN — confira o seed.

## Sprint 2 (TODO)

- Organizations: tabela + drawer com plano + maxUsers + status, ação
  de suspender/reativar.
- Plans: CRUD de planos da plataforma com features/limites.
- Audit log: stream de eventos (login, role change, billing change, etc.).
- E-mails enviados: lista de e-mails saídos do `MailService` (com retentativa).
- Settings: SMTP, OAuth providers, integrações.
