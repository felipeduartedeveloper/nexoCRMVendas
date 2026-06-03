import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationPlan } from '../organizations/organization.entity';

export type PlanKey = 'essential' | 'advanced' | 'professional' | 'power';
export type BillingCycle = 'monthly' | 'annual';

interface CheckoutInput {
  organizationId: string;
  plan: PlanKey;
  cycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
}

/** mapeia plan key (checkout) → enum do banco. */
const PLAN_ENUM: Record<PlanKey, OrganizationPlan> = {
  essential: OrganizationPlan.ESSENTIAL,
  advanced: OrganizationPlan.ADVANCED,
  professional: OrganizationPlan.PROFESSIONAL,
  power: OrganizationPlan.POWER,
};

/**
 * Integração com Stripe (Vendas). SDK carregado lazy. Preço resolvido SOMENTE no
 * servidor a partir de plan+cycle (cliente nunca envia preço). O plano só muda
 * por webhook (assinatura verificada) — nunca por endpoint direto.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe?: any;

  constructor(
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    private readonly config: ConfigService,
  ) {}

  isEnabled(): boolean {
    return !!this.config.get<string>('STRIPE_SECRET_KEY');
  }

  async createCheckoutSession(input: CheckoutInput): Promise<{ url: string }> {
    const stripe = await this.client();
    const key = `STRIPE_PRICE_${input.plan.toUpperCase()}_${input.cycle.toUpperCase()}`;
    const price = this.config.get<string>(key);
    if (!price) throw new BadRequestException(`Plano "${input.plan}/${input.cycle}" sem price configurado (${key})`);

    const org = await this.orgRepo.findOne({ where: { id: input.organizationId } });
    if (!org) throw new BadRequestException('Organização não encontrada');

    let customerId = org.stripeCustomerId;
    if (!customerId) {
      const cust = await stripe.customers.create({
        name: org.name,
        metadata: { organization_id: org.id },
      });
      customerId = cust.id;
      org.stripeCustomerId = customerId;
      await this.orgRepo.save(org);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: { organization_id: org.id, plan: input.plan, cycle: input.cycle },
      subscription_data: { metadata: { organization_id: org.id, plan: input.plan, cycle: input.cycle } },
    });
    if (!session.url) throw new BadRequestException('Stripe não retornou URL');
    return { url: session.url };
  }

  async createBillingPortal(organizationId: string, returnUrl: string): Promise<{ url: string }> {
    const stripe = await this.client();
    const org = await this.orgRepo.findOne({ where: { id: organizationId } });
    if (!org?.stripeCustomerId) throw new BadRequestException('Organização sem customer Stripe');
    const portal = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: returnUrl,
    });
    return { url: portal.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const stripe = await this.client();
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!secret) throw new BadRequestException('STRIPE_WEBHOOK_SECRET não configurado');

    let event: any;
    try {
      // constructEventAsync — obrigatório sob Bun (Web Crypto é assíncrono).
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret);
    } catch (err) {
      throw new BadRequestException(`Webhook inválido: ${(err as Error).message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await this.syncSubscription(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.cancelSubscription(event.data.object);
        break;
      default:
        this.logger.debug(`Webhook Stripe ignorado: ${event.type}`);
    }
  }

  private async syncSubscription(subOrSession: any): Promise<void> {
    const orgId = subOrSession.metadata?.organization_id;
    const subId = subOrSession.subscription ?? subOrSession.id;
    if (!orgId) {
      this.logger.warn(`Stripe webhook sem organization_id: ${subOrSession.id}`);
      return;
    }
    // Transação + lock de linha: entregas concorrentes/duplicadas serializam.
    await this.orgRepo.manager.transaction(async (em) => {
      const org = await em.findOne(Organization, {
        where: { id: orgId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!org) return;
      // Não reativa assinatura já cancelada por evento posterior (ordenação).
      if (org.subscriptionStatus === 'canceled' && org.stripeSubscriptionId === subId) {
        this.logger.warn(`Ignorando reativação de assinatura cancelada ${subId} (org ${orgId})`);
        return;
      }
      const planKey = (subOrSession.metadata?.plan ?? '') as PlanKey;
      org.stripeSubscriptionId = subId;
      org.subscriptionStatus = subOrSession.status ?? 'active';
      if (PLAN_ENUM[planKey]) org.plan = PLAN_ENUM[planKey];
      if (subOrSession.current_period_end) {
        org.subscriptionEndsAt = new Date(subOrSession.current_period_end * 1000);
      }
      this.applyPlanLimits(org);
      await em.save(org);
    });
  }

  private async cancelSubscription(sub: any): Promise<void> {
    const orgId = sub.metadata?.organization_id;
    if (!orgId) return;
    const subId = sub.subscription ?? sub.id;
    await this.orgRepo.manager.transaction(async (em) => {
      const org = await em.findOne(Organization, {
        where: { id: orgId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!org) return;
      if (org.stripeSubscriptionId && subId && org.stripeSubscriptionId !== subId) {
        this.logger.warn(`Ignorando cancelamento de assinatura antiga ${subId} (org ${orgId})`);
        return;
      }
      org.subscriptionStatus = 'canceled';
      org.plan = OrganizationPlan.TRIAL; // volta pro paywall (trial já expirado → bloqueia)
      org.trialEndsAt = new Date(0); // garante expirado
      this.applyPlanLimits(org);
      await em.save(org);
    });
  }

  private applyPlanLimits(org: Organization): void {
    const limits: Record<string, number> = {
      ESSENTIAL: 3,
      ADVANCED: 10,
      PROFESSIONAL: 0, // 0 = ilimitado
      POWER: 0,
      ENTERPRISE: 0,
      TRIAL: 5,
    };
    org.maxUsers = limits[org.plan] ?? 5;
  }

  private async client(): Promise<any> {
    if (!this.isEnabled()) throw new BadRequestException('Stripe não configurado');
    if (this.stripe) return this.stripe;
    try {
      const Stripe = (await import('stripe')).default;
      this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!, {
        apiVersion: '2024-06-20' as any,
      });
    } catch {
      throw new BadRequestException('Dependência "stripe" não instalada (bun add stripe)');
    }
    return this.stripe;
  }
}
