import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './entities/webhook.entity';
import { WebhooksService } from './webhooks.service';

export interface EventMeta {
  user_id?: string | null;
  timestamp?: string;
  [key: string]: unknown;
}

@Injectable()
export class WebhookEmitterService {
  private readonly logger = new Logger(WebhookEmitterService.name);

  constructor(
    @InjectRepository(Webhook) private readonly repo: Repository<Webhook>,
    private readonly svc: WebhooksService,
  ) {}

  emit(
    orgId: string,
    event: string,
    current: unknown,
    previous?: unknown,
    meta: EventMeta = {},
  ): void {
    void this.dispatch(orgId, event, current, previous, meta).catch((err) => {
      this.logger.warn(
        `Webhook emit failed for org=${orgId} event=${event}: ${err instanceof Error ? err.message : err}`,
      );
    });
  }

  private async dispatch(
    orgId: string,
    event: string,
    current: unknown,
    previous: unknown,
    meta: EventMeta,
  ): Promise<void> {
    const hooks = await this.repo.find({
      where: { organizationId: orgId, status: 'ACTIVE' },
    });
    const subscribed = hooks.filter((h) => h.events.includes(event));
    if (!subscribed.length) return;
    const payload = {
      event,
      current,
      previous: previous ?? null,
      meta: { ...meta, company_id: orgId, timestamp: meta.timestamp ?? new Date().toISOString() },
    };
    await Promise.all(
      subscribed.map((h) =>
        this.svc
          .deliver(h.id, event, payload as Record<string, unknown>)
          .catch((err) => this.logger.warn(`deliver failed: ${err}`)),
      ),
    );
  }
}
