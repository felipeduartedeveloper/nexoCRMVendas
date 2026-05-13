import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';
import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';
import { OrgCompany } from '../contacts/org-company.entity';
import { Deal } from '../deals/deal.entity';
import { Activity } from '../activities/activity.entity';
import { Lead } from '../leads/lead.entity';
import { Organization } from '../organizations/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Contact, OrgCompany, Deal, Activity, Lead, Organization]),
  ],
  providers: [UsageService],
  controllers: [UsageController],
})
export class UsageModule {}
