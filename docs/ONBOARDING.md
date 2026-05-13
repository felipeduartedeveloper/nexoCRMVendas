# Onboarding (fluxo Pipedrive)

Replicação exata do fluxo de Setup do Pipedrive.

## Diagrama

```
LandingPage
   │  "Teste grátis"
   ▼
RegisterPage   ─── POST /auth/register ──► e-mail com OTP 6 dígitos
   │
   ▼
Verify2faPage   ─── POST /auth/2fa/verify ──► tokens + user.emailVerified=true
   │
   ▼
PersonalInfoPage     (etapa 1/3: nome, telefone, papel)
   │
   ▼
CompanyInfoPage      (etapa 2/3: nome, setor, tamanho, país, website)
   │
   ▼
SetupTourPage        (etapa 3/3: 3 abas Contatos / Atividades / Negócios
   │                  com sample data + modal de feedback 5 estrelas)
   │
   │  POST /onboarding/complete  → cria Organization + Pipeline + Stages
   │                              + 2 contatos + 1 deal + 2 activities
   ▼
DashboardPage
```

## Estado entre passos

`useOnboardingDraft` (Zustand persistido em localStorage chave
`crmvendas.onboarding-draft`) acumula `personal`, `company` e
`feedbackScore`. É resetado ao concluir.

## Backend — `OnboardingService.completeOnboarding`

```ts
await dataSource.transaction(async (tx) => {
  // 1) Cria organization (plan=TRIAL, currency derivada do país)
  // 2) Atualiza user: organizationId + role=ADMIN
  // 3) Pipeline default (isDefault=true, currency)
  // 4) 6 Stages:
  //    "New Deal" (probability 10)
  //    "Contact Made" (probability 25)
  //    "Qualified" (probability 50)
  //    "Meeting Completed" (probability 70)
  //    "Negotiations Started" (probability 85)
  //    "Contract Signed" (probability 100, isWon=true)
  // 5) [Sample] MoveEr (OrgCompany)
  // 6) Benjamin Leon, Tony Turner (Contacts)
  // 7) [Sample] Tony Turner / MoveEr (Deal £30.000 em Contact Made)
  // 8) Final attempt CALL + Context call CALL (Activities due amanhã)
  // 9) onboarding_state.step = COMPLETED, completed_at = now()
});
```

Idempotência: se chamado de novo (org já criada), retorna a mesma org
sem reseedar.

## Estados possíveis

| Step          | Significado                                                             |
| ------------- | ----------------------------------------------------------------------- |
| PERSONAL_INFO | User criou conta, verificou e-mail, ainda não preencheu dados pessoais  |
| COMPANY_INFO  | Preencheu pessoais, falta empresa                                       |
| SETUP_TOUR    | Preencheu empresa, está vendo o tour com sample data                    |
| COMPLETED     | Concluiu — org + seed criados                                           |
