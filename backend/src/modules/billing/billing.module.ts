import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from '../organizations/organization.entity';
import { BillingController } from './billing.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Organization])],
  controllers: [BillingController],
  providers: [StripeService],
  exports: [StripeService],
})
export class BillingModule {}
