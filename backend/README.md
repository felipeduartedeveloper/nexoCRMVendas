# crmvendas — backend

API NestJS rodando em Bun. Clone funcional do [pipedrive.com](https://pipedrive.com).

## Stack

NestJS 10 · Bun 1.x · TypeScript · TypeORM · Postgres 16 · Redis 7 · JWT (access+refresh) · Passport · class-validator · Helmet · Throttler · Swagger · Socket.io · Nodemailer

## Estrutura

```
src/
├── main.ts                         Bootstrap (helmet, CORS, swagger, /api prefix)
├── app.module.ts                   Root module + global guards
├── common/
│   ├── decorators/                 @Public, @CurrentUser, @CurrentOrg, @Roles
│   ├── dto/                        PaginationDto
│   ├── enums/                      UserRole (SUPER_ADMIN, ADMIN, MANAGER, SALES, VIEWER)
│   ├── filters/                    HttpExceptionFilter
│   ├── guards/                     JwtAuthGuard (global), RolesGuard
│   ├── interceptors/               ResponseInterceptor (envelope { success, data })
│   ├── utils/                      tenant-scope (applyOrgScope, isSuperAdmin)
│   └── health.controller.ts        GET /health
├── config/
│   ├── typeorm.config.ts           Factory para TypeOrmModule
│   └── datasource.ts               CLI datasource (migrations)
└── modules/
    ├── auth/                       JWT access+refresh, 2FA email, forgot/reset password
    ├── users/                      CRUD + bootstrap SUPER_ADMIN
    ├── organizations/              Multi-tenant (cada signup cria sua org)
    └── mail/                       Nodemailer (fallback log se SMTP não configurado)
```

## Auth flow

1. **POST /api/auth/register** → cria user (não ativo) + envia OTP por email
2. **POST /api/auth/2fa/verify** (email + 6 dígitos) → marca emailVerified + retorna tokens
3. **POST /api/auth/login** → se emailVerified=false, envia novo OTP e retorna `{ requires2fa: true }`. Senão retorna `{ accessToken, refreshToken, user }`
4. **POST /api/auth/refresh** → rotate refresh token (singleflight via tokenHash)
5. **POST /api/auth/forgot-password** + **POST /api/auth/reset-password**
6. **POST /api/auth/logout** → revoga todos refresh tokens do user

Todas as rotas exigem JWT por padrão (`JwtAuthGuard` global). Rotas com `@Public()` são abertas.

## Roles

- `SUPER_ADMIN` — controla todas as organizações (painel `:5174`)
- `ADMIN` — admin da empresa (acessa `/settings/*` no app user)
- `MANAGER` — vê todas vendas/deals da equipe
- `SALES` — vê apenas seus próprios deals/contacts (default)
- `VIEWER` — só leitura

`RolesGuard` honra `@Roles(...)`. `SUPER_ADMIN` bypassa.

## Multi-tenant

Toda entidade de domínio (Contact, Deal, Activity, Lead, Pipeline) tem `organizationId` indexado. `applyOrgScope(qb, user, alias)` aplica filtro automaticamente. `SUPER_ADMIN` enxerga tudo.

## Comandos

```bash
bun install               # instalar deps
bun run start:dev         # dev (watch)
bun run build             # build prod
bun run start:prod        # rodar build

bun run migration:generate src/migrations/<Name>
bun run migration:run
bun run migration:revert
```

## Bootstrap

Ao subir, `UsersService.onModuleInit` cria o SUPER_ADMIN usando `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` (default: `admin@crmvendas.local` / `Admin@123`).

## Swagger

`http://localhost:3000/docs` (com `persistAuthorization`).
