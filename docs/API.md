# API

Base: `/api`. Swagger interativo em `/docs`.

Todas as respostas são envelopadas: `{ "success": true, "data": ... }`
(ou `{ "success": false, "error": { "code", "message" } }`).

## Auth (público)

| Método | Path                  | Body                                  | Retorno                                                          |
| ------ | --------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| POST   | /auth/register        | `{ email, password, name }`           | `{ requires2fa: true, message }`                                 |
| POST   | /auth/login           | `{ email, password }`                 | `{ user, accessToken, refreshToken }` ou `{ requires2fa: true }` |
| POST   | /auth/2fa/verify      | `{ email, code }`                     | `{ user, accessToken, refreshToken }`                            |
| POST   | /auth/2fa/resend      | `{ email }`                           | `{ message }`                                                    |
| POST   | /auth/refresh         | `{ refreshToken }`                    | `{ accessToken, refreshToken }`                                  |
| POST   | /auth/forgot-password | `{ email }`                           | `{ message }`                                                    |
| POST   | /auth/reset-password  | `{ token, password }`                 | `{ message }`                                                    |

## Auth (autenticado)

| Método | Path         | Notas                                |
| ------ | ------------ | ------------------------------------ |
| GET    | /auth/me     | retorna o user atual                 |
| POST   | /auth/logout | revoga o refresh token enviado       |

## Onboarding

| Método | Path                  | Body                                                                 |
| ------ | --------------------- | -------------------------------------------------------------------- |
| GET    | /onboarding/state     | —                                                                    |
| PATCH  | /onboarding/state     | `{ step, surveyData?, feedbackScore? }`                              |
| POST   | /onboarding/complete  | `{ personal, company, survey?, feedbackScore? }` → cria org + seed   |

## Domínio (autenticado, escopado por `organizationId`)

| Recurso     | Endpoints                                                |
| ----------- | -------------------------------------------------------- |
| /contacts   | GET (paginado, com `search`), GET /companies, GET /:id   |
| /activities | GET (paginado)                                           |
| /deals      | GET (paginado), GET /kanban/:pipelineId                  |
| /pipelines  | GET (com stages aninhados), GET /:id/stages              |
| /leads      | GET (paginado, filtro `?status=`)                        |

Sprint 1 entrega listas + filtros. CRUDs completos vêm no Sprint 2.

## Health

`GET /health` → `{ status: 'ok', uptime, dbOk, redisOk }`.

## Convenções de erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email must be an email"
  }
}
```

Códigos:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `INTERNAL` (500)
