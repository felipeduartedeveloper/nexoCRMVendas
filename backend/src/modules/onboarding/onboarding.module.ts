import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingState } from './onboarding-state.entity';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { Pipeline } from '../pipelines/pipeline.entity';
import { Stage } from '../pipelines/stage.entity';
import { Contact } from '../contacts/contact.entity';
import { OrgCompany } from '../contacts/org-company.entity';
import { Deal } from '../deals/deal.entity';
import { Activity } from '../activities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OnboardingState, Pipeline, Stage, Contact, OrgCompany, Deal, Activity]),
    OrganizationsModule,
    UsersModule,
  ],
  providers: [OnboardingService],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
