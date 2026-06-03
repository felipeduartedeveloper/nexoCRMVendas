/**
 * Fonte da verdade do acesso de uma organização (trial / assinatura) no Vendas.
 * Função PURA — usada pelo SubscriptionGuard (paywall 402) e pelo endpoint
 * GET /organizations/current (UI). O plano só muda por webhook Stripe ou
 * super-admin; nunca pelo cliente.
 */

export type AccessStatus = 'trial' | 'active' | 'expired' | 'none';

export interface OrgAccess {
  status: AccessStatus;
  daysLeft: number;
  trialEndsAt: string | null;
  plan: string;
}

/** Planos pagos do Vendas (liberam acesso quando a assinatura está ativa). */
const PAID_PLANS = new Set(['ESSENTIAL', 'ADVANCED', 'PROFESSIONAL', 'POWER', 'ENTERPRISE']);

interface OrgLike {
  plan?: string | null;
  trialEndsAt?: Date | string | null;
  subscriptionStatus?: string | null;
  subscriptionEndsAt?: Date | string | null;
}

const ms = (d?: Date | string | null): number | null => (d ? new Date(d).getTime() : null);

export function computeAccess(org: OrgLike, now = Date.now()): OrgAccess {
  const plan = (org.plan ?? 'TRIAL').toUpperCase();

  if (PAID_PLANS.has(plan)) {
    const sub = (org.subscriptionStatus ?? '').toLowerCase();
    const canceled = sub === 'canceled' || sub === 'unpaid' || sub === 'incomplete_expired';
    const ends = ms(org.subscriptionEndsAt);
    const withinPeriod = ends === null || ends > now;
    const active = !canceled && withinPeriod;
    return { status: active ? 'active' : 'expired', daysLeft: 0, trialEndsAt: null, plan };
  }

  if (plan === 'TRIAL') {
    const ends = ms(org.trialEndsAt);
    if (ends !== null && ends > now) {
      const daysLeft = Math.max(0, Math.ceil((ends - now) / 86_400_000));
      return { status: 'trial', daysLeft, trialEndsAt: new Date(ends).toISOString(), plan };
    }
    return { status: 'expired', daysLeft: 0, trialEndsAt: ends ? new Date(ends).toISOString() : null, plan };
  }

  return { status: 'none', daysLeft: 0, trialEndsAt: null, plan };
}

export function hasActiveAccess(access: OrgAccess): boolean {
  return access.status === 'trial' || access.status === 'active';
}
