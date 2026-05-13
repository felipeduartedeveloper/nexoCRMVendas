# Banco de dados

Postgres 16. TypeORM com `synchronize: true` em dev (migrations virão
no Sprint 2). UUIDs gerados via `pgcrypto`.

## Tabelas

### users

| Coluna           | Tipo                            | Notas                        |
| ---------------- | ------------------------------- | ---------------------------- |
| id               | uuid PK                         | `gen_random_uuid()`          |
| email            | varchar UNIQUE                  | normalizado lowercase        |
| password_hash    | varchar                         | bcrypt; `Exclude` na serial. |
| name             | varchar                         |                              |
| phone            | varchar nullable                |                              |
| role             | enum `UserRole`                 | default `SALES`              |
| organization_id  | uuid nullable INDEX             | FK lógico Organizations      |
| is_active        | boolean default true            |                              |
| email_verified   | boolean default false           |                              |
| avatar_url       | varchar nullable                |                              |
| locale           | varchar default 'pt-BR'         |                              |
| timezone         | varchar default 'America/SP'    |                              |
| last_login_at    | timestamptz nullable            |                              |
| created_at       | timestamptz                     |                              |
| updated_at       | timestamptz                     |                              |

### organizations

| Coluna           | Tipo                                                |
| ---------------- | --------------------------------------------------- |
| id               | uuid PK                                             |
| name             | varchar                                             |
| slug             | varchar UNIQUE                                      |
| status           | enum (ACTIVE, INACTIVE)                             |
| plan             | enum (TRIAL, ESSENTIAL, ADVANCED, PROFESSIONAL, POWER, ENTERPRISE) |
| max_users        | int default 5                                       |
| industry, employees_range, website, phone, country  | nullable                  |
| currency         | varchar default 'BRL'                               |
| notes            | text nullable                                       |
| created_at, updated_at                                                  |

### onboarding_states

Uma linha por user. Step enum (PERSONAL_INFO, COMPANY_INFO, SETUP_TOUR,
COMPLETED). `survey_data jsonb`, `feedback_score int`, `completed_at`.

### refresh_tokens

`{ id, user_id, token_hash (sha256), expires_at, revoked, created_at }`.

### pipelines / stages

- `pipelines`: { id, organization_id INDEX, name, is_default, currency, order_index }
- `stages`: { id, pipeline_id INDEX, name, order_index, win_probability, is_won }

### deals

`{ id, organization_id INDEX, pipeline_id, stage_id, stage_order_index,
title, value, currency, status (OPEN/WON/LOST/DELETED), owner_user_id,
contact_id, company_id, expected_close_at, created_at, updated_at }`.

### activities

`{ id, organization_id INDEX, type (CALL/MEETING/TASK/DEADLINE/EMAIL/LUNCH),
priority (LOW/MEDIUM/HIGH), title, notes, due_at, done_at, deal_id,
contact_id, owner_user_id }`.

### contacts / org_companies

- `contacts`: { id, organization_id INDEX, name, email, phone, job_title,
  company_id, owner_user_id, tags jsonb }
- `org_companies`: { id, organization_id INDEX, name, website, phone,
  industry, employees_range, country, owner_user_id }

### leads

`{ id, organization_id INDEX, status (INBOX/WORKING/ARCHIVED/CONVERTED),
title, value, currency, source, contact_id, company_id, owner_user_id }`.

## Índices

Toda entidade com `organization_id` tem `@Index()` nessa coluna. Deals
têm índice composto `(pipeline_id, stage_id, stage_order_index)` para
o Kanban.
