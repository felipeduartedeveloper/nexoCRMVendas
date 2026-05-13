import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';
import { OrgCompany } from '../contacts/org-company.entity';
import { Deal, DealStatus } from '../deals/deal.entity';
import { Activity } from '../activities/activity.entity';
import { Lead } from '../leads/lead.entity';
import { Organization } from '../organizations/organization.entity';

@Injectable()
export class UsageService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Contact) private readonly contacts: Repository<Contact>,
    @InjectRepository(OrgCompany) private readonly companies: Repository<OrgCompany>,
    @InjectRepository(Deal) private readonly deals: Repository<Deal>,
    @InjectRepository(Activity) private readonly activities: Repository<Activity>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    @InjectRepository(Organization) private readonly orgs: Repository<Organization>,
  ) {}

  async snapshot(orgId: string | null) {
    if (!orgId) return null;
    const org = await this.orgs.findOne({ where: { id: orgId } });
    const [
      usersCount,
      contactsCount,
      companiesCount,
      dealsOpen,
      dealsWon,
      dealsLost,
      activitiesCount,
      leadsCount,
    ] = await Promise.all([
      this.users.count({ where: { organizationId: orgId } }),
      this.contacts.count({ where: { organizationId: orgId } }),
      this.companies.count({ where: { organizationId: orgId } }),
      this.deals.count({ where: { organizationId: orgId, status: DealStatus.OPEN } }),
      this.deals.count({ where: { organizationId: orgId, status: DealStatus.WON } }),
      this.deals.count({ where: { organizationId: orgId, status: DealStatus.LOST } }),
      this.activities.count({ where: { organizationId: orgId } }),
      this.leads.count({ where: { organizationId: orgId } }),
    ]);
    return {
      plan: org?.plan,
      limits: {
        users: { used: usersCount, max: org?.maxUsers ?? 0 },
      },
      counts: {
        users: usersCount,
        contacts: contactsCount,
        companies: companiesCount,
        deals: { open: dealsOpen, won: dealsWon, lost: dealsLost },
        activities: activitiesCount,
        leads: leadsCount,
      },
    };
  }
}
