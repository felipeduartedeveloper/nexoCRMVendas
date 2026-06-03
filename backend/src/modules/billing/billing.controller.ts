import {
  BadRequestException, Body, Controller, Headers, Post, RawBodyRequest, Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';
import { StripeService } from './stripe.service';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly stripe: StripeService) {}

  @ApiBearerAuth()
  @Post('checkout')
  checkout(
    @Body() body: { plan: 'essential' | 'advanced' | 'professional' | 'power'; cycle?: 'monthly' | 'annual'; successUrl: string; cancelUrl: string },
    @CurrentOrg() orgId: string | null,
  ) {
    if (!orgId) throw new BadRequestException('Usuário sem organização');
    if (!['essential', 'advanced', 'professional', 'power'].includes(body.plan)) {
      throw new BadRequestException('Plano inválido');
    }
    const cycle = body.cycle === 'annual' ? 'annual' : 'monthly';
    return this.stripe.createCheckoutSession({
      organizationId: orgId,
      plan: body.plan,
      cycle,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
    });
  }

  @ApiBearerAuth()
  @Post('portal')
  portal(@Body() body: { returnUrl: string }, @CurrentOrg() orgId: string | null) {
    if (!orgId) throw new BadRequestException('Usuário sem organização');
    return this.stripe.createBillingPortal(orgId, body.returnUrl);
  }

  @Public()
  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    if (!req.rawBody) throw new BadRequestException('raw body ausente');
    await this.stripe.handleWebhook(req.rawBody, sig);
    return { received: true };
  }
}
