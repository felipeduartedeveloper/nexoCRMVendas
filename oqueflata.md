# 📋 oqueflata.md — Roadmap detalhado do que falta no oxlify

> Inventário completo do que ainda precisa ser feito no sistema **oxlify** (CRM de vendas, pasta `crmvendas/`). Comparativo entre o que já foi entregue, o que está parcial e o que ainda é placeholder/ausente.
>
> **Data desta versão:** 2026-05-15
> **Repo:** `git@github.com:felipeduartedeveloper/nexoCRMVendas.git`
> **Stack:** NestJS 10 + Bun + Postgres 16 + Redis + MinIO no backend / React 18 + Vite + TS + TanStack Query + Tailwind + lucide-react no frontend e admin

---

## 0. Sumário executivo

| Categoria | Status |
|---|---|
| Auth + onboarding | ✅ Completo |
| CRM core (Contacts, Deals, Activities, Pipelines, Leads) | ✅ Completo |
| Products, Projects | ✅ Completo |
| Marketing (Campaigns, Templates, Audiences, Recommendations, Settings) | ✅ Backend completo + Frontend completo, sem worker BullMQ |
| Webhooks (HMAC, retry, deliveries) | ✅ Completo (sem worker de retry agendado) |
| Settings — Company/General/Currencies/Labels/Lost Reasons | ✅ |
| Settings — Users/Roles/Invite | ✅ |
| Settings — Data Fields (11 dataTypes) | ✅ |
| Settings — Usage + Billing + Security Center | ⚠️ UI pronta, sem integração real Stripe |
| Branding oxlify (Logo, favicon, dark mode no shell) | ✅ Completo |
| Dark mode em páginas internas | ❌ Parcial — apenas o shell |
| Admin SaaS Console (`:5274`) | ❌ Apenas Dashboard + Users; resto placeholder |
| Automation Canvas (workflow builder visual) | ❌ Não iniciado |
| Mail/Caller/E-signature integrações reais | ❌ UI mock apenas |
| Leads sub-features (Prospector/Web Forms/Live Chat/Chatbot) | ❌ Não iniciado |
| Realtime WebSocket (Socket.io) | ❌ Backend tem módulo skeleton; sem uso real |
| Testes automatizados (unit / e2e) | ❌ Zero |
| CI/CD | ❌ Zero |
| Documentação fim-a-fim | ⚠️ Parcial (`docs/` tem 8 arquivos) |

---

## 1. O que JÁ está pronto (referência rápida)

Listagem do que NÃO precisa entrar neste roadmap porque já está entregue:

### Backend (`backend/src/modules/`)
- ✅ `auth/` — login/register/2FA/refresh/forgot/reset, JWT access+refresh, bcrypt 10 rounds
- ✅ `users/` — CRUD + invite com senha temp + activate/deactivate + bootstrap super admin
- ✅ `organizations/` — multi-tenant + Company settings (domain/locale/timezone/currency/maintenanceWindowUtc)
- ✅ `onboarding/` — wizard 3 passos + seed transactional (Pipeline default + 6 stages + 2 contacts + 1 deal Tony Turner + 2 activities)
- ✅ `contacts/` — CRUD People + Organizations + Timeline + Duplicates + Merge + bulk-delete
- ✅ `activities/` — CRUD + filtros (scope overdue/today/upcoming) + counters + toggle done
- ✅ `deals/` — CRUD + Kanban move transactional + win/lose/reopen + summary por stage + soft+hard delete
- ✅ `pipelines/` — CRUD pipelines+stages com reorder + isDefault único + bloqueio delete com deals OPEN
- ✅ `leads/` — CRUD + convert (Lead → Deal transactional) + archive + counters
- ✅ `products/` — Product+ProductPrice+DealProduct, 8 endpoints, billingFrequency 6 valores, addToDeal calculando subtotal/total
- ✅ `projects/` — ProjectBoard+ProjectPhase+Project+ProjectTask+ProjectDeal, 21 endpoints, ensureDefaultBoard seedando 4 phases, move + recalculateProgress
- ✅ `marketing/` — Campaign+EmailTemplate+Audience+CampaignRecipient+Recommendation+Settings, 22 endpoints, audience filter resolver QueryBuilder, recommendations generate
- ✅ `webhooks/` — Webhook+WebhookDelivery, HMAC sha256, retry tracking (5 tentativas), deliver via fetch+timeout, WebhookEmitterService @Global
- ✅ `mail/` — Nodemailer wrapper (mock se SMTP_HOST vazio)
- ✅ `labels/` + `lost-reasons/` + `custom-fields/` (11 dataTypes) + `usage/` (snapshot)
- ✅ `roles/` + `stages/` — entidades auxiliares
- ✅ `health/` — health endpoint
- ✅ `uploads/` — módulo MinIO (S3 client + presigned URLs)
- ✅ `realtime/` — módulo Socket.io scaffold (sem gateways de domínio ainda)

### Frontend (`frontend/src/features/`)
- ✅ `auth/` — Login/Register/Verify2fa/ForgotPassword/ResetPassword
- ✅ `onboarding/` — wizard 3 passos (PersonalInfo/CompanyInfo/SetupTour) + FeedbackModal
- ✅ `dashboard/` — KPIs + pipeline preview + atividades
- ✅ `app/` — SetupGuidePage com 4 goals expansíveis
- ✅ `contacts/` — 4 abas (People/Organizations/Timeline/Merge Duplicates) + drawer
- ✅ `activities/` — planilha 11 colunas + 4 counters + filtros + CalendarSyncBanner + drawer (sem Calendar view)
- ✅ `deals/` — Kanban DnD via @dnd-kit + drawer com tabs Atividades/Notas/E-mails/Arquivos + win/lose
- ✅ `leads/` — LeadsInbox 4 colunas + sidebar 4 grupos + Convert + FeatureCards mock
- ✅ `insights/` — sidebar My dashboards/Goals/My reports + 4 KPIs reais
- ✅ `sales-inbox/` — UI placeholder com sub-menu 5 folders + CTA conectar Gmail/Outlook
- ✅ `products/` — tabela + NewProductModal 4 seções + ProductDetailDrawer
- ✅ `projects/` — Kanban DnD + NewProjectModal + ProjectDetailDrawer + HealthBadge + ProgressBar
- ✅ `marketing/` — Layout + 5 páginas (Campaigns/Templates/Audiences/Recommendations/Settings) + NewCampaignModal wizard 3 steps
- ✅ `settings/` — Layout com 3 sections + 7 páginas (General/ManageUsers/DataFields/Usage/Billing/SecurityCenter/Webhooks)

### Branding oxlify
- ✅ Logo: 3 círculos conectados em gradient + wordmark `oxli` (gradient) + `fy` (preto) + sufixo `vendas` light
- ✅ Favicon SVG matching logo (azul no frontend, laranja no admin)
- ✅ Design tokens oklch em :root + .dark
- ✅ Dark mode store (zustand persistido em `oxlify-theme`) + ThemeToggle no Topbar
- ✅ rounded-xl padronizado igual crmModerno (0.75rem)

### Infraestrutura
- ✅ Docker Compose 7 containers (postgres/redis/minio/backend/frontend/admin/nginx) no grupo `crmvendas`
- ✅ Portas isoladas pra não colidir com o nexoCRM (5273/5274/3020/5434/6381/8082/9002-3)
- ✅ nginx do frontend e admin proxiando `/api → backend:3000` + `/socket.io/`

---

## 2. ❌ Páginas-feature ainda como `PlaceholderPage` no app user (azul)

Estas rotas existem no router mas mostram um placeholder genérico. Cada uma precisa de implementação completa (backend + frontend) ou pelo menos UI funcional.

### 2.1 `/profile` — Meu perfil
**O que falta:**
- Página com avatar (upload via MinIO), nome, email, telefone, cargo, idioma, fuso horário, formato de data
- Tab "Segurança": alterar senha, gerenciar 2FA, sessões ativas (lista de tokens válidos com revogar)
- Tab "Notificações": preferências de email/in-app por tipo de evento
- Backend: endpoint `GET/PATCH /users/me` (parcial — já tem em `users/`), upload avatar (uploads module), revogar sessão (não existe)

### 2.2 `/documents` — Documentos
**O que falta:**
- CRUD de documentos (PDFs/DOCs/imagens) anexados a contacts/deals/orgs
- Backend: entidade `Document` (id, organizationId, name, mimeType, sizeBytes, s3Key, contactId/dealId/orgCompanyId nullable, uploadedBy, createdAt) + service com presigned URL via uploads module + controller CRUD
- Frontend: página `/documents` com upload drag-and-drop + tabela com filtros por entidade vinculada + preview de PDF/imagem inline + download

### 2.3 `/automations` — Automações
**Esta é a maior peça do roadmap.** Ver seção 9 dedicada.

### 2.4 `/labels` — Etiquetas (página dedicada)
**O que falta:**
- A entidade `Label` já existe no backend
- Falta uma página dedicada que mostre todas as labels da org agrupadas por entityType (DEAL/CONTACT/COMPANY/LEAD/ACTIVITY) com count de itens vinculados + ações renomear/recolorir/apagar/mesclar duplicadas

### 2.5 `/billing` — Plano e cobrança
**Status atual:** existe `BillingPage.tsx` em settings mostrando 5 planos estáticos (Essential/Advanced/Professional/Power/Enterprise) sem integração real.
**O que falta:**
- Backend: módulo `billing/` integrando Stripe (criar customer, subscription, payment intent, invoices, webhook receiver)
- Entidades: `Subscription`, `Invoice`, `PaymentMethod`
- Frontend: trocar plano (upgrade/downgrade), histórico de faturas com download PDF, cartão de crédito armazenado (Stripe Elements), trial countdown real, bloqueio de features quando vencido

### 2.6 `/permissions` — Permissões granulares
**Status atual:** RBAC simples (SUPER_ADMIN/ADMIN/MANAGER/SALES/VIEWER) via `@Roles()` decorator e select inline em ManageUsers.
**O que falta:**
- Matrix granular CRUD por entidade × role (Deal/Contact/Org/Activity/Lead/Product/Project/Custom Object) com checkboxes Read/Create/Update/Delete/Export/Bulk-delete
- Visibility rules (Owner only / Team / Org-wide) por entidade
- Backend: entidade `PermissionRule` (id, organizationId, role, entity, action, allowed bool) + guard que consulta dinâmica
- Frontend: tabela editável

### 2.7 `/help` — Central de ajuda
**O que falta:**
- Página com busca, categorias de artigos, vídeos tutoriais, FAQ, chat com suporte
- Backend: pode usar Algolia/Meilisearch ou simplesmente conteúdo MDX estático
- Frontend: busca client-side em JSON de artigos + componente de "tickets" pra abrir chamado de suporte (integração com `support/` que ainda não existe)

### 2.8 `/integrations` — Integrações
**O que falta:**
- Marketplace de integrações de terceiros (Google Calendar, Gmail, Outlook, Slack, WhatsApp Business, Zapier, Make, HubSpot, Salesforce migration import)
- Backend: entidade `Integration` (id, organizationId, provider, status, config jsonb, oauthToken encrypted) + handlers OAuth por provider
- Frontend: galeria de cards com Connect/Disconnect/Configure por provider

---

## 3. ❌ Sub-rotas do `/settings/*` ainda como `SettingsPlaceholder`

15 sub-rotas mostram apenas título + descrição. Listagem:

### My account section
- **`/settings/personal`** — Personal preferences: idioma, fuso, formato data, formato número, primeiro dia da semana
- **`/settings/password`** — Password and login: alterar senha + 2FA + sessões ativas (revogar token específico)
- **`/settings/email-sync`** — Email sync: conectar Gmail/Outlook via OAuth, two-way sync, frequência, pasta de origem
- **`/settings/contact-sync`** — Contact sync: importar contatos do Google Contacts/Office365
- **`/settings/calendar-sync`** — Calendar sync: conectar Google Calendar/Outlook Calendar, sincronizar atividades
- **`/settings/drive`** — Google Drive: vincular conta + escolher pasta padrão para documentos
- **`/settings/devices`** — Your devices: lista de dispositivos conectados (mobile/desktop) com revogar
- **`/settings/notifications`** — Notifications: preferências granulares (email + push + in-app) por evento
- **`/settings/referral`** — Referral program: link único de indicação + métricas + recompensas
- **`/settings/interface`** — Interface preferences: densidade (compact/comfortable), animações on/off, theme override

### Company overview
- **`/settings/company-overview`** — Visão consolidada da empresa: cards com user count, MRR, deals fechados no mês, contratos ativos

### Company settings
- **`/settings/user-overview`** — Visão geral por usuário com filtro de período + métricas individuais
- **`/settings/beta`** — Beta program: habilitar features experimentais (feature flags por usuário)
- **`/settings/dashboard`** — Dashboard das settings (visão consolidada dos itens configurados)
- **`/settings/alerts`** — Alerts: regras de notificação automática (ex: "avisar quando deal X dias sem atividade")
- **`/settings/rules`** — Rules: regras de automação simples sem o canvas (ex: "auto-atribuir leads de website ao Vendedor X")
- **`/settings/sso`** — Single sign-on: configurar SAML/OIDC com Google Workspace, Microsoft Entra, Okta

**Para todas estas:** UI + backend específico por sub-rota. A maioria precisa integração com providers externos (Google OAuth, Microsoft OAuth, SAML IdP).

---

## 4. ❌ Admin SaaS Console (`:5274`) — Sprint 2

Painel laranja separado para o SUPER_ADMIN gerenciar a plataforma SaaS. Atualmente só tem **Dashboard** (4 KPIs estáticos) e **Users** (tabela ligada ao GET /users global).

Faltam:

### 4.1 `/organizations` — Multi-tenant
- Lista de todas as organizações com filtros (plano, status, data criação, MRR)
- Detail por org: usuários, owner, atividade recente, dados de cobrança, ações (suspender, deletar, login como)
- Endpoint backend: `GET /admin/organizations` (não existe — só `/organizations/current`)

### 4.2 `/plans` — Planos SaaS
- CRUD de planos (Essential/Advanced/Professional/Power/Enterprise) com limites (max users, max deals, max contacts, features ativas)
- Entidade `Plan` no backend + relacionamento com Organization
- Sync com Stripe Products/Prices

### 4.3 `/audit` — Trilha de auditoria
- Log de todas as ações sensíveis (login admin, alteração de role, delete de entidade crítica, export de dados, alteração de billing)
- Entidade `AuditLog` (id, organizationId nullable, userId, action, entity, entityId, payload jsonb, ip, userAgent, createdAt)
- Frontend: tabela paginada com filtros por org/user/action/período

### 4.4 `/emails` — Email broadcasts
- Enviar email transacional ou broadcast para conjuntos de usuários
- Templates de email (welcome, password reset, plan upgrade, suspension notice)
- Stats de delivery (delivered/opened/clicked/bounced)

### 4.5 `/security` — Segurança do SaaS
- Configurações globais: força mínima de senha, expiração de token, IP allowlist do painel admin, 2FA obrigatório
- Lista de IPs banidos
- Tentativas de login suspeitas

### 4.6 `/settings` (admin) — Configurações do SaaS
- Configurar SMTP, S3, Stripe keys, providers de OAuth, JWT secrets (rotação)

---

## 5. ❌ Dark mode em páginas internas

**Status:** Shell (AppShell + Sidebar + Topbar) já alterna entre light e dark via classes `bg-card`/`bg-background`/`border-border`/`text-foreground` que reagem à classe `.dark` no `<html>`.

**Faltam migrar** ~25 páginas que ainda usam classes hardcoded (`bg-white`, `text-ink-900`, `border-ink-200`):

- `frontend/src/features/dashboard/pages/DashboardPage.tsx`
- `frontend/src/features/app/pages/SetupGuidePage.tsx`
- `frontend/src/features/app/pages/PlaceholderPage.tsx`
- `frontend/src/features/contacts/pages/ContactsPage.tsx` + 4 tabs + drawer
- `frontend/src/features/activities/pages/ActivitiesPage.tsx` + drawer + NewActivityModal
- `frontend/src/features/deals/pages/DealsPage.tsx` + DealCard + KanbanColumn + drawer
- `frontend/src/features/leads/pages/LeadsPage.tsx`
- `frontend/src/features/insights/pages/InsightsPage.tsx`
- `frontend/src/features/sales-inbox/pages/SalesInboxPage.tsx`
- `frontend/src/features/products/pages/ProductsPage.tsx` + modal + drawer
- `frontend/src/features/projects/pages/ProjectsBoardPage.tsx` + componentes
- `frontend/src/features/marketing/**` (5 páginas)
- `frontend/src/features/settings/**` (7 páginas + SettingsLayout)
- `frontend/src/features/onboarding/**` (3 páginas + Shell)

**Padrão de migração:**
- `bg-white` → `bg-card`
- `bg-ink-50` → `bg-muted/40`
- `bg-ink-100` → `bg-muted`
- `text-ink-900` → `text-foreground`
- `text-ink-700` → `text-foreground/80`
- `text-ink-500/600` → `text-muted-foreground`
- `border-ink-200` → `border-border`
- `border-ink-100` → `border-border/50`

Manter `bg-brand-*` (azul puro) inalterado, mas considerar `bg-primary` para sinalização semântica.

---

## 6. ❌ Atividades — Calendar View

**Status atual:** `ActivitiesPage.tsx` tem só a view de tabela. Existe um `CalendarSyncBanner` mock.

**Falta:**
- View `/activities/calendar` com calendário mensal (componente próprio sem deps, ou usar `@fullcalendar/react`)
- Drag-and-drop pra reagendar
- Botão pra alternar entre Lista / Calendário no topo
- Filtros por tipo (CALL/MEETING/TASK/EMAIL/DEADLINE) com cores
- Sync bidirecional com Google Calendar (depende de `/settings/calendar-sync`)

---

## 7. ❌ Insights — Dashboards customizados

**Status atual:** `InsightsPage.tsx` mostra apenas snapshot estático (4 KPIs ligados ao `/usage/current`) + empty states de Dashboards/Goals/Reports.

**Falta:**
- Builder de dashboard: arrastar widgets (chart bar/line/pie/funnel/scorecard) em grid
- Entidade `Dashboard` + `DashboardWidget` (config jsonb com tipo, dataSource, filtros)
- Reports library: 5 templates já listados, mas precisam gerar dados reais
  - Deals won by stage
  - Pipeline value over time
  - Sales by team member
  - Activities completed
  - Lead conversion rate
- Goals: criar goal (target, métrica, período, owner), tracking automático, alerts quando atinge ou está atrás
- Export PDF/CSV de cada dashboard

---

## 8. ❌ Mail Integration real (Sales Inbox)

**Status atual:** `SalesInboxPage.tsx` é placeholder UI com sub-menu 5 folders (Inbox/Drafts/Outbox/Sent/Archive) + CTA "Conectar Gmail/Outlook".

**Falta:**
- OAuth2 com Google Workspace (Gmail API) e Microsoft (Microsoft Graph API)
- Backend: entidades `MailAccount`, `MailThread`, `MailMessage`, `MailAttachment`
- Service que faz polling/push de novos emails, normaliza para o modelo interno
- Auto-link: parsing do endereço FROM/TO, match com contacts da org, vincular thread a contact/deal/lead
- Composer: editor rich-text simples (TipTap ou ProseMirror) com inline images, anexos, merge fields {{contact.firstName}}
- Templates pessoais por usuário
- Stats: open tracking (pixel) e click tracking (redirect)
- Frontend: lista de threads com unread badge, view de conversa com timeline, reply inline, encaminhar

---

## 9. ❌ Automation Canvas (workflow builder visual)

**O maior módulo ausente.** O Pipedrive tem `/settings/automation/canvas-v2/:id` que permite criar workflows visuais.

### 9.1 Modelo de dados
- `Automation` (id, organizationId, name, status ENABLED/DISABLED/DRAFT, triggerType, createdBy, updatedAt)
- `AutomationNode` (id, automationId, type ENUM, position {x,y}, config jsonb, parentNodeId nullable)
- `AutomationRun` (id, automationId, triggeredAt, triggerEntityId, status RUNNING/SUCCESS/FAILED/SKIPPED, error)
- `AutomationStepLog` (id, runId, nodeId, executedAt, status, output jsonb, error)

### 9.2 Triggers suportados
- `deal.added` / `deal.updated` / `deal.stage_changed` / `deal.won` / `deal.lost`
- `person.added` / `person.updated`
- `organization.added` / `organization.updated`
- `activity.added` / `activity.completed` / `activity.overdue`
- `lead.added` / `lead.converted`
- `time.schedule` (cron-like: every Monday 9am, every 1st of month)
- `webhook.received` (HTTP trigger)
- `form.submitted` (web form)

### 9.3 Actions suportadas
- **Email**: send_email (template + audience), send_email_to_owner
- **Notification**: notify_user (in-app + push), notify_team
- **Field update**: update_field (em deal/person/org)
- **Stage change**: change_deal_stage
- **Activity**: create_activity (com data relativa: "em 3 dias")
- **Status change**: mark_deal_won/lost, archive_lead
- **Owner**: assign_owner (round-robin, least-busy, specific user)
- **Webhook**: send_webhook (HTTP POST)
- **Integration**: post_to_slack, send_whatsapp, create_calendar_event

### 9.4 Condições / Lógica
- `if/else` baseado em qualquer campo da entidade trigger
- Operadores: equals, not_equals, contains, greater_than, less_than, is_null, is_in_list
- AND / OR / NOT
- `delay` (esperar X minutos/horas/dias antes da próxima ação)
- `wait_until` (esperar até data específica ou condição)
- `loop` sobre coleção (ex: para cada deal do contact)

### 9.5 Frontend — Canvas
- Biblioteca: `reactflow` (ou `@xyflow/react`)
- Sidebar esquerda: árvore de nodes disponíveis (Triggers, Actions, Logic) drag-and-drop pro canvas
- Sidebar direita: properties do node selecionado (configurar gatilho/ação)
- Topbar: nome editável, Save, Test (executa com dados sintéticos), Activate (toggle ENABLED), History (link pra `/settings/automation/history`)
- Validação visual: nodes sem config válida ficam vermelhos
- Auto-layout com botão "organizar"

### 9.6 Engine
- Worker BullMQ `automation:trigger` que recebe eventos do `WebhookEmitterService` (já existe) ou de cron
- Executa o grafo do automation respeitando delays/conditions
- Salva `AutomationRun` + `AutomationStepLog` para auditoria
- Idempotência: trigger.add com idempotency key pra não processar mesmo evento 2x

### 9.7 Templates galeria
- 10-15 templates pré-feitos: "Welcome new contact", "Re-engage cold lead", "Notify owner of stale deal", "Send invoice on deal won", etc.
- `/settings/automation/templates` com cards + botão "Usar template"

### 9.8 History
- `/settings/automation/history` paginado com filtros por automation/status/período
- Cada run expansível mostrando os logs de cada step

---

## 10. ❌ Marketing — Worker BullMQ real

**Status atual:** o `marketing.service.ts` tem um TODO comentado em `sendNow()` indicando que falta o worker. Hoje a função marca status SENT diretamente sem enviar email de verdade.

**Falta:**
- Instalar `bullmq` no backend
- Conectar a Redis (já está no compose)
- Fila `marketing:campaign-send` com job que:
  - Resolve audience filters em contactIds
  - Para cada contact, cria CampaignRecipient
  - Chama `mail.service.send()` com bodyHtml interpolado (merge fields `{{contact.firstName}}`)
  - Marca recipient como SENT após sucesso (ou BOUNCED se falhar)
  - Atualiza `campaign.metrics` agregando
- Worker separado (`backend/src/workers/marketing.worker.ts`) ou processor no mesmo NestJS
- Tracking pixel: `/api/marketing/track/open/:recipientId` retornando 1x1 GIF, marca recipient como OPENED
- Link wrapper: `/api/marketing/track/click/:recipientId/:linkId` redireciona pra URL real, marca recipient como CLICKED + atualiza metrics.uniqueClicks

---

## 11. ❌ Webhooks — Worker de retry agendado

**Status atual:** `webhooks.service.ts` já calcula `nextRetryAt` em caso de falha, mas não há scheduler chamando `retryPending()`.

**Falta:**
- Adicionar @nestjs/schedule (ou BullMQ delayed job)
- Cron a cada 1 min que faz `SELECT * FROM webhook_deliveries WHERE success = false AND nextRetryAt <= NOW() AND attempt < 5`
- Re-executar `webhooks.service.deliver(webhookId, event, payload, attempt + 1)`
- Quando attempt = 5 e ainda falha, marca webhook como `FAILING`
- Métrica de webhooks `FAILING` no admin

---

## 12. ❌ Realtime — Socket.io ativo

**Status atual:** backend tem `realtime/` module skeleton; frontend tem proxy `/socket.io/` no nginx mas nenhum cliente conecta.

**Falta:**

### Backend
- `RealtimeGateway` com namespaces por orgId
- Eventos emitidos:
  - `deal.moved` quando deal muda stage
  - `deal.updated` em qualquer update
  - `activity.created/done`
  - `contact.created/updated`
  - `notification.new`
- Auth no WS via JWT (handshake middleware)
- Room por orgId para multi-tenant isolation

### Frontend
- `useRealtime` hook que conecta no Socket.io após login
- Cada feature que tem listing inscreve nos eventos relevantes e invalida TanStack Query (`qc.invalidateQueries`)
- Indicator visual quando alguém do time edita o mesmo deal/contact (presence)

---

## 13. ❌ Leads — Sub-features faltantes

A página `/leads` já existe com 4 colunas inbox/working/archived/converted. Faltam as 4 sub-features do Leads módulo do Pipedrive:

### 13.1 Prospector (`/leads/prospector`)
- Busca de empresas/pessoas externas (mock pode usar dados sintéticos ou integração com API tipo Clearbit/Apollo/Lusha)
- Filtros: indústria, tamanho da empresa, país, cargo, tecnologia usada
- Lista resultados com botão "Adicionar como lead"
- Limites de busca por plano

### 13.2 Web Forms (`/leads/web-forms`)
- Form builder: campos (text/email/phone/select/textarea/checkbox), validação, mensagem de sucesso
- Snippet de embed: `<script src="https://oxlify.com/embed/forms/:id.js"></script>`
- Estilização: cores, fonte, logo, layout
- Backend: entidade `WebForm` + endpoint público `POST /public/forms/:id/submit` que cria Lead automaticamente
- Frontend: preview ao vivo, código embed copiável, lista de submissions por form

### 13.3 Live Chat (`/leads/live-chat`)
- Widget JS para embed em sites
- Backend: entidade `ChatSession` + `ChatMessage` + WS dedicado
- Agente vê visitantes online em tempo real, pode iniciar conversa, transferir
- Visitor info: pages viewed, location (geo IP), session duration
- Auto-criar Lead quando visitor preenche email

### 13.4 Chatbot (`/leads/chatbot`)
- Builder de fluxo (similar ao Automation Canvas mas simplificado)
- Nodes: pergunta, resposta múltipla escolha, captura email/phone, condicional, hand off para humano
- Bot prequalifica lead antes de passar pra time

---

## 14. ❌ Caller / VoIP (`/settings/caller`)

**Status atual:** sub-rota não está sequer no router/SettingsLayout.

**Falta:**
- Integração com Twilio Voice ou Plivo
- Backend: entidade `CallLog` (id, contactId, dealId, userId, direction IN/OUT, status COMPLETED/MISSED/VOICEMAIL, durationSec, recordingUrl, createdAt)
- Endpoints: criar chamada (Twilio webhook recebe TwiML), receber chamada (incoming webhook), encerrar, transferir
- Frontend: discador no Topbar (ícone telefone), histórico em `/settings/caller`, botão "Ligar" inline em contact card
- Permissão por plano (Power/Enterprise)

---

## 15. ❌ Sales Documents / E-signature (`/settings/sales-documents`)

**Status atual:** sub-rota não está implementada nem no router atual.

**Falta:**
- Templates de documentos (proposta, contrato, NDA, recibo) com Handlebars/Liquid syntax pra merge fields
- Builder com editor rich-text + variáveis (insert {{deal.value}}, {{contact.fullName}}, {{org.address}})
- Geração: PDF via Puppeteer ou wkhtmltopdf no backend
- E-signature: integração com DocuSign, ZapSign ou autograph caseiro (canvas + IP+timestamp+hash)
- Tracking: enviado, visto, assinado, downloaded
- Entidade `SalesDocument` (id, dealId, templateId, status DRAFT/SENT/SIGNED/EXPIRED, signedAt, signedBy, pdfS3Key, createdBy)

---

## 16. ❌ Pipedrive AI Assistant (`/settings/pipedrive-ai`)

**Falta:**
- Sub-rota Settings + UI configuração
- Backend: integração com OpenAI/Anthropic Claude API
- Features:
  - **Auto-summary de deal**: resume notas + emails + atividades em 1 parágrafo
  - **Próximas ações sugeridas**: dado o estado do deal, sugere call/email/proposta
  - **Email writing assistant**: gera draft de email baseado em prompt + contexto do contact
  - **Auto-assign de leads**: ML simples treinado com histórico de conversão por owner
  - **Análise preditiva**: probabilidade de fechar deal X% baseado em features (value/idade/atividades)
- Config: API key (Bring Your Own Key ou plano premium incluso), preferências por feature, limit de tokens/mês

---

## 17. ❌ Import / Export real

**Status atual:** o módulo `usage/` retorna snapshot, mas não há import real.

### Import (`/settings/import`)
- Upload CSV/XLSX (drag-and-drop)
- Detecção automática de colunas + mapping manual (origem CSV → campo do CRM)
- Preview das primeiras 10 linhas com warnings de validação
- Duplicate handling: skip, merge, replace
- Suporte a entidades: contacts, organizations, deals, products, leads
- Background job (BullMQ) processando em lote com progress bar
- Endpoint `POST /imports/upload` + `GET /imports/:id/status`

### Export (`/settings/export`)
- Seleção de entidade + filtros
- Formato: CSV, XLSX, JSON
- Background job que gera arquivo em S3 + envia email com link de download (expira em 24h)
- Endpoint `POST /exports` + `GET /exports/:id/status`

---

## 18. ❌ Duplicates (`/settings/duplicates`)

**Status atual:** o `contacts.service.ts` tem `findDuplicates()` e `merge()` por email. Existe a aba "Merge duplicates" na página `/contacts`.

**Falta como página dedicada em settings:**
- Configuração de regras: quais campos definem duplicata (email, phone, name+org, etc.)
- Detecção fuzzy (Levenshtein distance pra nomes parecidos)
- Run automático periódico (BullMQ scheduled)
- Mostrar duplicatas pra todas entidades (contacts/orgs/deals/leads), não só contacts
- Merge wizard com seleção campo-a-campo de qual valor manter

---

## 19. ❌ Teams (`/settings/teams`)

**Falta:**
- Entidade `Team` (id, organizationId, name, color, leaderId, createdAt)
- `TeamMember` (teamId, userId, role IN_TEAM)
- Endpoints CRUD
- Frontend: lista de times com count de membros + leader + ações
- Usado em: round-robin de leads, filtros nos relatórios, hierarquia de gerencia

---

## 20. ❌ Visibility Groups (`/settings/visibility-groups`)

**Falta:**
- Entidade `VisibilityGroup` + `VgMember`
- Permite definir "quem vê o quê" além de roles
- Ex: grupo "Time Inside Sales" só vê deals abaixo de R$ 50k; grupo "Field Sales" só vê acima
- Guards customizados que filtram queries por VG do usuário
- Frontend: builder de regras de visibilidade

---

## 21. ⚠️ Activities Drawer — funcionalidades extras

**Status atual:** drawer abre, edit inline funciona, toggle done funciona.

**Falta:**
- Aba "Comments" com thread de comentários internos (entidade `ActivityComment` simples)
- Anexos (uploads MinIO)
- Recorrência (Activity.recurrence jsonb: daily/weekly/monthly + endDate ou count)
- Reminders/notificações antes do dueDate (5min, 30min, 1h, 1day antes)

---

## 22. ⚠️ Deal Drawer — funcionalidades extras

**Status atual:** drawer com tabs Atividades/Notas/E-mails/Arquivos, mas Notas/E-mails/Arquivos são placeholder.

**Falta:**
- **Notas**: CRUD inline (entidade `DealNote` simples) com markdown editor mínimo
- **E-mails**: timeline de emails enviados/recebidos vinculados (depende de Mail Integration)
- **Arquivos**: lista de Documents vinculados ao deal (depende de `/documents`)
- **Products vinculados** (já tem backend, falta UI nesta tab): tabela editável com qty/discount/tax e total geral
- **Histórico de mudanças** (audit log do próprio deal: stage changes, value changes, owner changes)

---

## 23. ⚠️ Settings — Páginas existentes com lacunas

### `GeneralPage` (`/settings/company`)
- ✅ General/Activities/Currencies/Lost reasons/Labels — todas implementadas
- ❌ Falta sub-aba "Activities" com configuração de tipos customizados (hoje só CALL/MEETING/TASK/EMAIL/DEADLINE hardcoded)
- ❌ Activity priorities customizáveis (hoje só LOW/MEDIUM/HIGH hardcoded)

### `ManageUsersPage` (`/settings/users`)
- ✅ Tabela + invite + role select + activate/deactivate
- ❌ Falta: filtros (por role, status, team), bulk actions, last login column, transfer ownership ao desativar

### `DataFieldsPage` (`/settings/data-fields`)
- ✅ Criar custom field com 11 dataTypes
- ❌ Falta: reorder via drag, hide/show columns na listing, mandatory toggle, default value, validation regex/min/max

### `BillingPage` (`/settings/billing`)
- ✅ 5 cards de planos
- ❌ Falta integração real Stripe (ver seção 2.5)

### `SecurityCenterPage` (`/settings/security`)
- ✅ 4 controles UI (2FA/sessões/alertas/auditoria)
- ❌ Falta toggles funcionais (apenas estática hoje)
- ❌ Sessões ativas precisa endpoint `GET /auth/sessions` + `DELETE /auth/sessions/:id`
- ❌ Audit log precisa entidade + service

---

## 24. ❌ i18n — internacionalização

**Status atual:** todo conteúdo em PT-BR hardcoded.

**Falta:**
- `react-i18next` ou `lingui`
- Arquivos `pt-BR.json`, `en.json`, `es.json` (mínimo)
- LanguagePicker (já existia uma versão na LandingPage que removemos) na sub-rota `/settings/personal`
- Backend: errors traduzidas via `Accept-Language` header
- Date/number formatting via Intl com a locale do usuário

---

## 25. ❌ Testes automatizados

**Status atual:** zero testes.

**Falta:**

### Backend
- Vitest ou Jest configurado
- Unit tests dos services (mocks do repository) — pelo menos os críticos: deals.service (move/win/lose), webhooks.service (deliver + HMAC), marketing.service (resolveAudienceContactIds), projects.service (move + recalculateProgress)
- Integration tests com supertest contra app em memória + banco de teste
- E2E auth flow (register → 2FA → login → onboarding → first deal)

### Frontend
- Vitest + React Testing Library
- Snapshot dos componentes UI
- Hooks customizados (useAuthStore, useThemeStore)
- E2E com Playwright: smoke test do login + criar deal + arrastar Kanban

### CI
- GitHub Actions workflow `test.yml` rodando em PRs
- Cobertura mínima 60% pra merge

---

## 26. ❌ CI/CD

**Status atual:** zero.

**Falta:**
- `.github/workflows/test.yml` — lint + typecheck + tests em cada PR
- `.github/workflows/build.yml` — build docker images e push pra GHCR ou Docker Hub
- `.github/workflows/deploy.yml` — deploy automático em push pra `main` (Railway, Fly.io, AWS, ou VPS via SSH)
- Variáveis sensíveis via GitHub Secrets
- Branch protection rules: require PR review + passing tests
- Migrations TypeORM (hoje usa `synchronize:true` que NÃO deve ir pra produção)
- Strategy de migrations: cada PR que muda schema gera migration; CI valida que synchronize == migrations geram mesmo schema

---

## 27. ❌ Migrations TypeORM

**Status atual:** `synchronize: true` no docker-compose (DB_SYNC=true). Funciona em dev mas é perigoso em produção.

**Falta:**
- Gerar migrations iniciais com `bun run migration:generate src/migrations/InitialSchema`
- Configurar dev pra rodar migrations em vez de synchronize: setar DB_SYNC=false + DB_RUN_MIGRATIONS=true
- Workflow: cada mudança de entidade → gerar migration → commitar junto com a entidade
- Migration de seed inicial: cria roles default, plans default, super_admin

---

## 28. ❌ Mobile / PWA

**Falta:**
- Manifest.json com ícones (192px, 512px) + theme_color + display:standalone
- Service Worker via Vite PWA plugin para caching offline-first
- Push notifications via Firebase Cloud Messaging ou Web Push API
- Layout responsivo: a maioria das páginas hoje é desktop-first; precisa breakpoints para mobile (sidebar vira drawer, tabelas viram cards, modals fullscreen)
- App mobile nativo (long-term): React Native ou Flutter (já tem o `appmybuilder` que pode servir de base)

---

## 29. ❌ Compliance / LGPD / GDPR

**Falta:**
- Página `/legal/privacy` e `/legal/terms` (texto legal)
- Cookies banner com opt-in granular (functional/analytics/marketing)
- Export de dados pessoais do usuário (right to data portability): GET `/users/me/data-export` retorna ZIP com todos os dados do user
- Right to be forgotten: DELETE `/users/me/account` que anonimiza dados (não deleta hard pra preservar integridade referencial)
- Audit log de quem acessou dados sensíveis (PII)
- Encryption at rest dos campos PII (email, phone) — postgres pgcrypto ou app-level
- DPA (Data Processing Agreement) downloadável

---

## 30. ❌ Performance / Observabilidade

**Falta:**
- **Logging estruturado**: NestJS Logger → Winston/Pino com JSON output + correlation IDs
- **Métricas**: Prometheus endpoint `/metrics` com counters/histograms (requests, db queries, BullMQ jobs)
- **Tracing**: OpenTelemetry pra distributed tracing (span entre frontend → backend → BD)
- **Error tracking**: Sentry no frontend e backend
- **APM**: Datadog/New Relic ou self-hosted Grafana + Loki + Tempo
- **Caching**: Redis cache nos endpoints GET pesados (já tem cache-manager-redis-yet instalado mas não usado)
- **Index review** no Postgres: garantir que todos `organizationId`, `stageId`, `pipelineId`, `dealId`, `contactId` têm índices (já tem na maioria, mas auditar)
- **Pagination cursor-based** em endpoints com >100k registros (hoje usa offset)
- **Rate limiting** por usuário/org além do throttler global atual (que é por IP)

---

## 31. ❌ Documentação

**Status atual:** `docs/` tem 8 arquivos: ARCHITECTURE, API, BACKEND, FRONTEND, ADMIN, DATABASE, ONBOARDING, DOCKER. Mas nenhum cobre os módulos novos (Products, Projects, Marketing, Webhooks).

**Falta:**
- Atualizar `docs/BACKEND.md` com Products/Projects/Marketing/Webhooks modules
- Atualizar `docs/DATABASE.md` com as novas 16 entities (era 10)
- Atualizar `docs/API.md` com os ~70 endpoints novos
- Atualizar `docs/FRONTEND.md` com novas features (products, projects, marketing) + dark mode
- Atualizar `docs/ADMIN.md` listando o que ainda é placeholder
- Criar `docs/AUTOMATIONS.md` quando implementar a feature
- Criar `docs/WEBHOOKS.md` documentando os 16 eventos + payload + signature verification
- Criar `docs/THEMING.md` com a paleta oklch + dark mode pattern
- Criar `docs/CONTRIBUTING.md` com setup local + convenções
- Atualizar `README.md` raiz com lista atual de features

---

## 32. ❌ Setup Guide — implementar de verdade

**Status atual:** `SetupGuidePage.tsx` tem 4 goal cards expansíveis mas só visual.

**Falta:**
- Tracking real do progresso (quais steps o usuário completou)
- Backend: entidade `OnboardingProgress` por usuário com array de steps completed
- Cada step: importar contatos, criar primeiro deal, conectar email, convidar time, configurar pipeline
- Persistir no DB + barra de progresso real (X de N concluídos)
- Botão "Marcar como concluído" manual em cada step

---

## 33. ❌ Notificações in-app

**Falta:**
- Entidade `Notification` (id, userId, type, title, body, data jsonb, readAt nullable, createdAt)
- Bell icon na Topbar com badge de count (já tem o ícone + badge fake)
- Dropdown com lista das últimas 10 notificações
- Página `/notifications` com paginação completa
- Emit via Socket.io quando notification.new
- Triggers automáticos: novo deal atribuído, atividade vencida, deal ganho/perdido, novo lead inbox, webhook falhando

---

## 34. ❌ Outros pequenos itens

- **Search global**: a barra de busca no Topbar não funciona; precisa endpoint `GET /search?q=...` que busca cross-entity (contacts/orgs/deals/activities) com ranking por relevância
- **Quick add (+) no Topbar**: o botão "Novo" não faz nada; deveria abrir menu com Deal/Contact/Organization/Activity/Lead/Note quick-creators
- **Keyboard shortcuts**: `c` cria contact, `d` cria deal, `a` cria activity, `/` foca search, etc. (Cmd-K palette)
- **Smart links**: detectar URLs em notas/descrições e linkar
- **Tags color picker**: hoje labels têm color hardcoded; permitir paleta customizada
- **Currency conversion**: deals em moedas diferentes precisam ser convertidos pra moeda da org pra agregação (usar API tipo Frankfurter ou armazenar rates manualmente)
- **Two-way email reply**: replies aos emails enviados via Sales Inbox precisam ser captados (depende de Mail Integration full)
- **Bulk edit**: selecionar múltiplos contacts/deals na lista e editar campos em massa
- **Saved filters / Views**: salvar combinação de filtros como "view" reusável
- **Custom views per user**: ordem de colunas, colunas visíveis, sort default

---

## 35. 📊 Priorização sugerida

Se eu fosse cliente do produto, atacaria nesta ordem:

### Fase 1 — Polish e completude do core (1-2 semanas)
1. Dark mode em todas as páginas internas
2. Testes unitários dos services críticos (deals, webhooks, marketing)
3. Migrations TypeORM + remover synchronize
4. Notificações in-app + Socket.io ativo
5. Migrar Settings sub-routes simples (Personal preferences, Password, Notifications, Interface)

### Fase 2 — Diferencial competitivo (2-4 semanas)
6. **Automation Canvas** completo (essa é a feature flagship que justifica o preço)
7. Mail Integration real (Gmail/Outlook OAuth)
8. Insights Dashboards builder
9. Setup Guide com tracking real

### Fase 3 — Admin SaaS Console (1-2 semanas)
10. Organizations + Plans + Audit completos
11. Stripe integration real (billing)
12. Email broadcasts admin

### Fase 4 — Sub-features Leads (2-3 semanas)
13. Web Forms builder + embed
14. Live Chat widget
15. Chatbot fluxo
16. Prospector com API externa

### Fase 5 — Pro features (3+ semanas)
17. Caller / VoIP (Twilio)
18. Sales Documents + E-signature
19. Pipedrive AI Assistant
20. Teams + Visibility Groups + Permissions matrix
21. i18n EN/ES

### Fase 6 — Plataforma (ongoing)
22. CI/CD completo
23. Observability (Sentry + Prometheus)
24. PWA + mobile responsivo
25. LGPD/GDPR compliance
26. Performance audit + caching

---

## 36. 📌 Notas finais

- Este documento foi gerado em **2026-05-15** baseado no estado real do código no commit `2a79d4a` ou posterior.
- **Total estimado de trabalho restante**: ~3-4 meses de 1 dev full-time, ou ~6-8 semanas com time de 3 devs.
- **Linhas de código novas estimadas**: ~15-20k LoC frontend + ~10-15k LoC backend.
- O sistema atual já é **funcional e demonstrável** — falta principalmente diferencial vs Pipedrive (Automation Canvas) e polish (dark mode, i18n, mobile).
- Próximo passo recomendado: priorizar Automation Canvas, pois é o que mais agrega valor percebido e é a peça que mais falta vs concorrentes.

> Para perguntas sobre prioridades ou estimativas de feature específica, abrir issue no repo ou anotar aqui.
