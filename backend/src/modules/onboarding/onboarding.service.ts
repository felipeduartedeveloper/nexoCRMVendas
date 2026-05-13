import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OnboardingState, OnboardingStep } from './onboarding-state.entity';
import { UpdateOnboardingDto, CompleteOnboardingDto } from './dto/update-onboarding.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/user-role.enum';
import { Pipeline } from '../pipelines/pipeline.entity';
import { Stage } from '../pipelines/stage.entity';
import { Contact } from '../contacts/contact.entity';
import { OrgCompany } from '../contacts/org-company.entity';
import { Deal, DealStatus } from '../deals/deal.entity';
import { Activity, ActivityType, ActivityPriority } from '../activities/activity.entity';

const DEFAULT_STAGES = [
  { name: 'New Deal', probability: 10, color: '#6b7280' },
  { name: 'Contact Made', probability: 25, color: '#3a64ff' },
  { name: 'Qualified', probability: 50, color: '#0ea5e9' },
  { name: 'Meeting Completed', probability: 70, color: '#10b981' },
  { name: 'Negotiations started', probability: 85, color: '#f59e0b' },
  { name: 'Contract Signed', probability: 100, color: '#22c55e', isWon: true },
];

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(OnboardingState) private readonly stateRepo: Repository<OnboardingState>,
    private readonly orgs: OrganizationsService,
    private readonly users: UsersService,
  ) {}

  async getState(userId: string): Promise<OnboardingState> {
    let state = await this.stateRepo.findOne({ where: { userId } });
    if (!state) {
      state = this.stateRepo.create({
        userId,
        step: OnboardingStep.PERSONAL_INFO,
        surveyData: {},
      });
      state = await this.stateRepo.save(state);
    }
    return state;
  }

  async updateState(userId: string, dto: UpdateOnboardingDto): Promise<OnboardingState> {
    const state = await this.getState(userId);
    if (dto.step) state.step = dto.step;
    if (dto.surveyData) state.surveyData = { ...(state.surveyData || {}), ...dto.surveyData };
    return this.stateRepo.save(state);
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto): Promise<OnboardingState> {
    const user = await this.users.findById(userId);

    const org = await this.orgs.create({
      name: dto.companyName,
      industry: dto.industry,
      employeesRange: dto.employeesRange,
      country: dto.country,
      currency: dto.currency || 'USD',
    });

    await this.users.setOrganization(user.id, org.id);
    await this.users.setRole(user.id, UserRole.ADMIN);

    await this.dataSource.transaction(async (tx) => {
      const pipelineRepo = tx.getRepository(Pipeline);
      const stageRepo = tx.getRepository(Stage);
      const contactRepo = tx.getRepository(Contact);
      const orgCompanyRepo = tx.getRepository(OrgCompany);
      const dealRepo = tx.getRepository(Deal);
      const activityRepo = tx.getRepository(Activity);

      const pipeline = await pipelineRepo.save(
        pipelineRepo.create({
          organizationId: org.id,
          name: 'Sales pipeline',
          orderIndex: 0,
          isDefault: true,
          currency: org.currency || 'USD',
        }),
      );

      const stages: Stage[] = [];
      for (let i = 0; i < DEFAULT_STAGES.length; i++) {
        const s = DEFAULT_STAGES[i];
        const stage = await stageRepo.save(
          stageRepo.create({
            pipelineId: pipeline.id,
            organizationId: org.id,
            name: s.name,
            orderIndex: i,
            probability: s.probability,
            color: s.color,
            isWon: !!s.isWon,
          }),
        );
        stages.push(stage);
      }

      const sampleCompany = await orgCompanyRepo.save(
        orgCompanyRepo.create({
          organizationId: org.id,
          name: '[Sample] MoveEr',
          industry: 'Logistics',
          ownerUserId: user.id,
        }),
      );

      const contactBenjamin = await contactRepo.save(
        contactRepo.create({
          organizationId: org.id,
          name: '[Sample] Benjamin Leon',
          email: 'benjamin.leon@gmail.com',
          phone: '785-202-7824',
          ownerUserId: user.id,
          isSample: true,
        }),
      );
      const contactTony = await contactRepo.save(
        contactRepo.create({
          organizationId: org.id,
          name: '[Sample] Tony Turner',
          email: 'tony.turner@moveer.com',
          phone: '218-348-8528',
          orgCompanyId: sampleCompany.id,
          ownerUserId: user.id,
          isSample: true,
        }),
      );

      const sampleDeal = await dealRepo.save(
        dealRepo.create({
          organizationId: org.id,
          title: '[Sample] Tony Turner / MoveEr',
          value: 30000,
          currency: org.currency || 'USD',
          pipelineId: pipeline.id,
          stageId: stages[1].id,
          stageOrderIndex: 0,
          contactId: contactTony.id,
          orgCompanyId: sampleCompany.id,
          ownerUserId: user.id,
          status: DealStatus.OPEN,
          isSample: true,
        }),
      );

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await activityRepo.save([
        activityRepo.create({
          organizationId: org.id,
          subject: '[Sample] Final attempt',
          type: ActivityType.CALL,
          priority: ActivityPriority.HIGH,
          dueAt: tomorrow,
          durationMin: 15,
          contactId: contactBenjamin.id,
          ownerUserId: user.id,
          isSample: true,
        }),
        activityRepo.create({
          organizationId: org.id,
          subject: '[Sample] Context call',
          type: ActivityType.CALL,
          priority: ActivityPriority.MEDIUM,
          dueAt: tomorrow,
          durationMin: 30,
          contactId: contactTony.id,
          orgCompanyId: sampleCompany.id,
          dealId: sampleDeal.id,
          ownerUserId: user.id,
          isSample: true,
        }),
      ]);
    });

    const state = await this.getState(userId);
    state.step = OnboardingStep.COMPLETED;
    state.completedAt = new Date();
    if (dto.feedbackScore) state.feedbackScore = dto.feedbackScore;
    state.surveyData = {
      ...(state.surveyData || {}),
      companyName: dto.companyName,
      industry: dto.industry,
      employeesRange: dto.employeesRange,
      role: dto.role,
      useCase: dto.useCase,
    };
    return this.stateRepo.save(state);
  }
}
