import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-yet';

import { typeOrmConfig } from './config/typeorm.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HealthController } from './common/health.controller';

import { MailModule } from './modules/mail/mail.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { AuthModule } from './modules/auth/auth.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DealsModule } from './modules/deals/deals.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { LeadsModule } from './modules/leads/leads.module';
import { LabelsModule } from './modules/labels/labels.module';
import { LostReasonsModule } from './modules/lost-reasons/lost-reasons.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { UsageModule } from './modules/usage/usage.module';
import { ProductsModule } from './modules/products/products.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { MarketingModule } from './modules/marketing/marketing.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL || 60) * 1000,
        limit: Number(process.env.THROTTLE_LIMIT || 100),
      },
    ]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore.redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT || 6379),
          },
          password: process.env.REDIS_PASSWORD || undefined,
        }),
        ttl: 60,
      }),
    }),

    MailModule,
    UsersModule,
    OrganizationsModule,
    AuthModule,
    OnboardingModule,
    ContactsModule,
    ActivitiesModule,
    DealsModule,
    PipelinesModule,
    LeadsModule,
    LabelsModule,
    LostReasonsModule,
    CustomFieldsModule,
    UsageModule,
    ProductsModule,
    ProjectsModule,
    MarketingModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
