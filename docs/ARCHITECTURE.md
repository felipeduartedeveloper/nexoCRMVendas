# Arquitetura

CRM Vendas é um SaaS multi-tenant onde múltiplas empresas (`Organization`)
operam o mesmo banco, isoladas pelo campo `organizationId` em cada entidade
de domínio.

## Camadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Nginx (porta 80)                          │
│   /            → frontend:5173                                       │
│   /admin/*     → admin:5174                                          │
│   /api/*       → backend:3000                                        │
│   /socket.io/* → backend:3000 (WebSocket upgrade)                    │
└─────────────────────────────────────────────────────────────────────┘
       │                    │                       │
       ▼                    ▼                       ▼
  ┌────────┐           ┌────────┐             ┌──────────┐
  │frontend│           │ admin  │             │ backend  │
  │ React  │           │ React  │             │ NestJS   │
  │ +Vite  │           │ +Vite  │             │ + Bun    │
  └────────┘           └────────┘             └──────────┘
                                                   │
                          ┌────────────────────────┼────────────────────┐
                          ▼                        ▼                    ▼
                     ┌─────────┐             ┌─────────┐          ┌────────┐
                     │ Postgres│             │  Redis  │          │ MinIO  │
                     │   16    │             │    7    │          │  S3-c  │
                     └─────────┘             └─────────┘          └────────┘
```

## Multi-tenancy

- Cada `User` tem `organizationId` (ou null se for SUPER_ADMIN).
- Cada entidade de domínio (`Deal`, `Contact`, `Activity`, `Pipeline`,
  `Stage`, `Lead`, `OrgCompany`) também tem `organizationId` indexado.
- O helper `applyOrgScope(qb, user, alias)` em
  `backend/src/common/utils/tenant-scope.ts` adiciona o filtro automaticamente.
- `SUPER_ADMIN` ignora o filtro — vê todas as organizações.

## Papéis (RBAC)

| Papel         | Onde                | Pode                                                         |
| ------------- | ------------------- | ------------------------------------------------------------ |
| SUPER_ADMIN   | admin (`:5174`)     | Gerenciar plataforma toda, todas as orgs                     |
| ADMIN         | frontend (`:5173`)  | Gerenciar sua organização (usuários, planos, configurações)  |
| MANAGER       | frontend            | Gerir time, ver tudo da org, sem mexer em billing            |
| SALES         | frontend            | Gerir próprios deals/contatos/atividades                     |
| VIEWER        | frontend            | Somente leitura                                              |

Atribuídos via `@Roles(...)` + `RolesGuard`.

## Autenticação

- **Access token** JWT curto (15 min)
- **Refresh token** JWT longo (30 dias), hash SHA256 persistido em
  `refresh_tokens` com rotação (revoked flag) — cada refresh emite um novo
  e revoga o anterior.
- Reset de senha: token aleatório bcrypt-hashed, expira em 1h.
- 2FA: OTP de 6 dígitos enviado por e-mail, expira em 10 min, requerido
  no primeiro login após registro até `emailVerified=true`.

## Camadas dentro do backend

- `modules/*` — features (auth, users, organizations, onboarding, deals…)
- `common/` — guards, interceptors, filters, DTOs compartilhados
- `config/` — typeorm config
- `database/` — migrations (Sprint 2)

## Onboarding e seed

`OnboardingService.completeOnboarding(userId, payload)` cria em uma
transação:

1. `Organization` (com plan=TRIAL)
2. Atualiza `user.organizationId` + `user.role = ADMIN`
3. `Pipeline` default (isDefault=true, currency da org)
4. 6 `Stage` default (New Deal → Contract Signed)
5. 1 `OrgCompany` "[Sample] MoveEr"
6. 2 `Contact` (Benjamin Leon, Tony Turner)
7. 1 `Deal` "[Sample] Tony Turner / MoveEr" £30.000 em Contact Made
8. 2 `Activity` (Final attempt — CALL, Context call — CALL) due amanhã
