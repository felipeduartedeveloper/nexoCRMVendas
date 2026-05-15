import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac, randomBytes } from 'node:crypto';
import { Webhook } from './entities/webhook.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import {
  CreateWebhookDto,
  SUPPORTED_EVENTS,
  SetStatusDto,
  UpdateWebhookDto,
} from './dto/webhook.dto';

const RETRY_DELAYS_MS = [
  60_000,
  300_000,
  1_800_000,
  7_200_000,
  43_200_000,
];

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook) private readonly repo: Repository<Webhook>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepo: Repository<WebhookDelivery>,
  ) {}

  async list(orgId: string | null): Promise<Webhook[]> {
    return this.repo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, orgId: string | null): Promise<Webhook> {
    const w = await this.repo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!w) throw new NotFoundException('Webhook not found');
    return w;
  }

  async create(orgId: string | null, userId: string, dto: CreateWebhookDto): Promise<Webhook> {
    if (!orgId) throw new BadRequestException('Organization is required');
    this.validateEvents(dto.events);
    const secret = randomBytes(16).toString('hex');
    const w = this.repo.create({
      organizationId: orgId,
      ownerUserId: userId,
      name: dto.name ?? this.hostFromUrl(dto.targetUrl),
      targetUrl: dto.targetUrl,
      events: dto.events,
      secret,
      status: 'ACTIVE',
    });
    return this.repo.save(w);
  }

  async update(id: string, orgId: string | null, dto: UpdateWebhookDto): Promise<Webhook> {
    const w = await this.findOne(id, orgId);
    if (dto.events) this.validateEvents(dto.events);
    Object.assign(w, dto);
    return this.repo.save(w);
  }

  async setStatus(id: string, orgId: string | null, dto: SetStatusDto): Promise<Webhook> {
    const w = await this.findOne(id, orgId);
    w.status = dto.status;
    if (dto.status === 'ACTIVE') w.consecutiveFailures = 0;
    return this.repo.save(w);
  }

  async regenerateSecret(id: string, orgId: string | null): Promise<Webhook> {
    const w = await this.findOne(id, orgId);
    w.secret = randomBytes(16).toString('hex');
    return this.repo.save(w);
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const w = await this.findOne(id, orgId);
    await this.deliveryRepo.delete({ webhookId: id });
    await this.repo.remove(w);
  }

  async listDeliveries(
    id: string,
    orgId: string | null,
    page = 1,
    limit = 50,
  ): Promise<{ items: WebhookDelivery[]; total: number; page: number; limit: number; pages: number }> {
    await this.findOne(id, orgId);
    const [items, total] = await this.deliveryRepo.findAndCount({
      where: { webhookId: id, organizationId: orgId ?? undefined },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async deliver(
    webhookId: string,
    event: string,
    payload: Record<string, unknown>,
    attempt = 1,
  ): Promise<WebhookDelivery> {
    const w = await this.repo.findOne({ where: { id: webhookId } });
    if (!w) throw new NotFoundException('Webhook not found');
    if (w.status !== 'ACTIVE') {
      return this.deliveryRepo.save(
        this.deliveryRepo.create({
          webhookId: w.id,
          organizationId: w.organizationId,
          event,
          payload,
          attempt,
          statusCode: null,
          responseBody: 'Webhook paused/failing',
          success: false,
        }),
      );
    }

    if (!w.events.includes(event)) {
      return this.deliveryRepo.save(
        this.deliveryRepo.create({
          webhookId: w.id,
          organizationId: w.organizationId,
          event,
          payload,
          attempt,
          statusCode: null,
          responseBody: 'Event not subscribed',
          success: false,
        }),
      );
    }

    const body = JSON.stringify(payload);
    const signature = 'sha256=' + createHmac('sha256', w.secret).update(body).digest('hex');
    const started = Date.now();
    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let success = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const resp = await fetch(w.targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Oxlify-Signature': signature,
          'X-Oxlify-Event': event,
          'User-Agent': 'oxlify-Webhooks/1.0',
        },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      statusCode = resp.status;
      success = resp.status >= 200 && resp.status < 300;
      const text = await resp.text();
      responseBody = text.length > 4000 ? text.slice(0, 4000) + '... [truncated]' : text;
    } catch (err) {
      responseBody = err instanceof Error ? err.message : String(err);
      success = false;
    }

    const latencyMs = Date.now() - started;
    const nextRetryAt =
      !success && attempt <= RETRY_DELAYS_MS.length
        ? new Date(Date.now() + RETRY_DELAYS_MS[attempt - 1])
        : null;

    const delivery = await this.deliveryRepo.save(
      this.deliveryRepo.create({
        webhookId: w.id,
        organizationId: w.organizationId,
        event,
        payload,
        attempt,
        statusCode,
        responseBody,
        latencyMs,
        success,
        nextRetryAt,
      }),
    );

    if (success) {
      w.consecutiveFailures = 0;
      w.lastDeliveryAt = new Date();
      w.lastStatusCode = statusCode;
    } else {
      w.consecutiveFailures += 1;
      w.lastStatusCode = statusCode;
      if (w.consecutiveFailures >= 5) w.status = 'FAILING';
    }
    await this.repo.save(w);

    return delivery;
  }

  async testDelivery(
    id: string,
    orgId: string | null,
    event?: string,
  ): Promise<WebhookDelivery> {
    const w = await this.findOne(id, orgId);
    const ev = event ?? w.events[0] ?? 'deal.added';
    const payload = {
      event: ev,
      meta: {
        company_id: w.organizationId,
        timestamp: new Date().toISOString(),
        test: true,
      },
      current: { id: 'test-id', title: 'Test payload' },
      previous: null,
    };
    return this.deliver(w.id, ev, payload);
  }

  listSupportedEvents(): readonly string[] {
    return SUPPORTED_EVENTS;
  }

  private validateEvents(events: string[]): void {
    const supported = new Set<string>(SUPPORTED_EVENTS as readonly string[]);
    const invalid = events.filter((e) => !supported.has(e));
    if (invalid.length) {
      throw new BadRequestException(`Eventos inválidos: ${invalid.join(', ')}`);
    }
  }

  private hostFromUrl(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url.slice(0, 50);
    }
  }
}
