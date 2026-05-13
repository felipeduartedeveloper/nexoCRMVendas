# Backend

NestJS 10 + Bun runtime + TypeORM + Postgres + Redis + JWT.

## Estrutura

```
backend/
├── src/
│   ├── main.ts                  # bootstrap (helmet, CORS, ValidationPipe, Swagger)
│   ├── app.module.ts
│   ├── config/typeorm.config.ts
│   ├── common/
│   │   ├── enums/user-role.enum.ts
│   │   ├── decorators/{current-user,public,roles}.decorator.ts
│   │   ├── dto/pagination.dto.ts
│   │   ├── filters/http-exception.filter.ts
│   │   ├── guards/{jwt-auth,roles}.guard.ts
│   │   ├── interceptors/response.interceptor.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   ├── utils/tenant-scope.ts
│   │   └── health.controller.ts
│   └── modules/
│       ├── mail/                # Nodemailer (SMTP)
│       ├── users/               # User + bootstrap SUPER_ADMIN
│       ├── organizations/       # Organization CRUD
│       ├── auth/                # register, login, refresh, 2fa, forgot/reset
│       ├── onboarding/          # state + complete (seed sample data)
│       ├── contacts/            # Contact + OrgCompany
│       ├── activities/          # Activity (CALL/MEETING/TASK/DEADLINE/EMAIL/LUNCH)
│       ├── deals/               # Deal (OPEN/WON/LOST/DELETED) + kanban endpoint
│       ├── pipelines/           # Pipeline + Stage
│       └── leads/               # Lead (INBOX/WORKING/ARCHIVED/CONVERTED)
└── package.json
```

## Convenções

- Resposta envelopada por `ResponseInterceptor`: `{ success: true, data: ... }`
- Erros tratados por `HttpExceptionFilter`: `{ success: false, error: { code, message } }`
- Todos os endpoints autenticados por padrão (global `JwtAuthGuard`); use
  `@Public()` para abrir endpoints (login, register, healthcheck).
- Decorator `@CurrentUser()` injeta o user do JWT; `@CurrentOrg()` injeta
  somente o `organizationId` (ou null para SUPER_ADMIN).
- Paginação via `PaginationDto` (page, limit, search) → retorna
  `PaginatedResult<T>` `{ items, total, page, limit, pages }`.

## Mail

`MailService` em `modules/mail/mail.service.ts` usa Nodemailer com SMTP
configurado via env. Em dev usa Mailtrap por padrão. Templates inline:

- `sendVerification(email, code)` — código de 6 dígitos (2FA + verify e-mail)
- `sendPasswordReset(email, link)` — link `https://app/reset-password?token=…`

## Bootstrap SUPER_ADMIN

`UsersService.onModuleInit` cria `admin@crmvendas.local` / `Admin@123` se
não existir. Customize via env `ADMIN_BOOTSTRAP_EMAIL` /
`ADMIN_BOOTSTRAP_PASSWORD` / `ADMIN_BOOTSTRAP_NAME`.
