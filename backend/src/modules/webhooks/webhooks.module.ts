import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './entities/webhook.entity';
import { WebhookDelivery } from './entities/webhook-delivery.entity';
import { WebhooksService } from './webhooks.service';
import { WebhookEmitterService } from './webhook-emitter.service';
import { WebhooksController } from './webhooks.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Webhook, WebhookDelivery])],
  providers: [WebhooksService, WebhookEmitterService],
  controllers: [WebhooksController],
  exports: [WebhooksService, WebhookEmitterService],
})
export class WebhooksModule {}
