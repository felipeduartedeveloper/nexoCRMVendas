import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { Audience, type AudienceFilter } from './entities/audience.entity';
import { CampaignRecipient } from './entities/campaign-recipient.entity';
import {
  MarketingRecommendation,
  type RecommendationType,
} from './entities/marketing-recommendation.entity';
import { MarketingSettings } from './entities/marketing-settings.entity';
import { Contact } from '../contacts/contact.entity';
import {
  CreateAudienceDto,
  CreateCampaignDto,
  CreateTemplateDto,
  PreviewAudienceDto,
  UpdateAudienceDto,
  UpdateCampaignDto,
  UpdateMarketingSettingsDto,
  UpdateTemplateDto,
} from './dto/marketing.dto';

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Campaign) private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(EmailTemplate) private readonly templateRepo: Repository<EmailTemplate>,
    @InjectRepository(Audience) private readonly audienceRepo: Repository<Audience>,
    @InjectRepository(CampaignRecipient) private readonly recipientRepo: Repository<CampaignRecipient>,
    @InjectRepository(MarketingRecommendation)
    private readonly recRepo: Repository<MarketingRecommendation>,
    @InjectRepository(MarketingSettings) private readonly settingsRepo: Repository<MarketingSettings>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
  ) {}

  // ────── Campaigns ──────
  async listCampaigns(orgId: string | null, status?: string): Promise<Campaign[]> {
    const where: any = orgId ? { organizationId: orgId } : {};
    if (status) where.status = status;
    return this.campaignRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getCampaign(id: string, orgId: string | null): Promise<Campaign> {
    const c = await this.campaignRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!c) throw new NotFoundException('Campaign not found');
    return c;
  }

  async createCampaign(orgId: string | null, userId: string, dto: CreateCampaignDto): Promise<Campaign> {
    if (!orgId) throw new BadRequestException('Organization is required');
    const c = this.campaignRepo.create({
      ...dto,
      organizationId: orgId,
      ownerUserId: userId,
      status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      metrics: {
        sent: 0,
        delivered: 0,
        opens: 0,
        uniqueOpens: 0,
        clicks: 0,
        uniqueClicks: 0,
        bounces: 0,
        unsubscribes: 0,
        audienceSize: 0,
      },
    });
    return this.campaignRepo.save(c);
  }

  async updateCampaign(id: string, orgId: string | null, dto: UpdateCampaignDto): Promise<Campaign> {
    const c = await this.getCampaign(id, orgId);
    Object.assign(c, {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : c.scheduledAt,
    });
    return this.campaignRepo.save(c);
  }

  async deleteCampaign(id: string, orgId: string | null): Promise<void> {
    const c = await this.getCampaign(id, orgId);
    await this.campaignRepo.remove(c);
  }

  async scheduleCampaign(id: string, orgId: string | null, scheduledAt: string): Promise<Campaign> {
    const c = await this.getCampaign(id, orgId);
    c.scheduledAt = new Date(scheduledAt);
    c.status = 'SCHEDULED';
    return this.campaignRepo.save(c);
  }

  async sendNow(id: string, orgId: string | null): Promise<Campaign> {
    const c = await this.getCampaign(id, orgId);
    if (!c.audienceId) throw new BadRequestException('Campaign has no audience');
    const audience = await this.getAudience(c.audienceId, orgId);
    const contactIds = await this.resolveAudienceContactIds(orgId, audience.filters);
    // TODO: enfileirar entrega real via worker BullMQ
    const recipients = contactIds.map((cid) =>
      this.recipientRepo.create({
        campaignId: c.id,
        contactId: cid,
        status: 'SENT',
        sentAt: new Date(),
      }),
    );
    await this.recipientRepo.save(recipients);
    c.status = 'SENT';
    c.sentAt = new Date();
    c.metrics = {
      ...c.metrics,
      sent: contactIds.length,
      delivered: contactIds.length,
      audienceSize: contactIds.length,
    };
    return this.campaignRepo.save(c);
  }

  async pauseCampaign(id: string, orgId: string | null): Promise<Campaign> {
    const c = await this.getCampaign(id, orgId);
    c.status = 'PAUSED';
    return this.campaignRepo.save(c);
  }

  async getMetrics(id: string, orgId: string | null) {
    const c = await this.getCampaign(id, orgId);
    return c.metrics;
  }

  // ────── Templates ──────
  async listTemplates(orgId: string | null): Promise<EmailTemplate[]> {
    return this.templateRepo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async createTemplate(orgId: string | null, userId: string, dto: CreateTemplateDto) {
    if (!orgId) throw new BadRequestException('Organization is required');
    const t = this.templateRepo.create({
      ...dto,
      organizationId: orgId,
      ownerUserId: userId,
    });
    return this.templateRepo.save(t);
  }

  async updateTemplate(id: string, orgId: string | null, dto: UpdateTemplateDto) {
    const t = await this.templateRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!t) throw new NotFoundException('Template not found');
    Object.assign(t, dto);
    return this.templateRepo.save(t);
  }

  async duplicateTemplate(id: string, orgId: string | null, userId: string) {
    const orig = await this.templateRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!orig) throw new NotFoundException('Template not found');
    const copy = this.templateRepo.create({
      ...orig,
      id: undefined,
      name: `${orig.name} (cópia)`,
      ownerUserId: userId,
    });
    return this.templateRepo.save(copy);
  }

  async deleteTemplate(id: string, orgId: string | null): Promise<void> {
    const t = await this.templateRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!t) throw new NotFoundException('Template not found');
    await this.templateRepo.remove(t);
  }

  // ────── Audiences ──────
  async listAudiences(orgId: string | null): Promise<Audience[]> {
    return this.audienceRepo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async getAudience(id: string, orgId: string | null): Promise<Audience> {
    const a = await this.audienceRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!a) throw new NotFoundException('Audience not found');
    return a;
  }

  async createAudience(orgId: string | null, userId: string, dto: CreateAudienceDto) {
    if (!orgId) throw new BadRequestException('Organization is required');
    const filters = (dto.filters ?? []) as AudienceFilter[];
    const ids = await this.resolveAudienceContactIds(orgId, filters);
    const a = this.audienceRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      filters,
      estimatedSize: ids.length,
      organizationId: orgId,
      ownerUserId: userId,
    });
    return this.audienceRepo.save(a);
  }

  async updateAudience(id: string, orgId: string | null, dto: UpdateAudienceDto) {
    const a = await this.getAudience(id, orgId);
    if (dto.filters) {
      const ids = await this.resolveAudienceContactIds(orgId, dto.filters as AudienceFilter[]);
      a.filters = dto.filters as AudienceFilter[];
      a.estimatedSize = ids.length;
    }
    if (dto.name) a.name = dto.name;
    if (dto.description !== undefined) a.description = dto.description ?? null;
    return this.audienceRepo.save(a);
  }

  async deleteAudience(id: string, orgId: string | null): Promise<void> {
    const a = await this.getAudience(id, orgId);
    await this.audienceRepo.remove(a);
  }

  async previewAudience(orgId: string | null, dto: PreviewAudienceDto) {
    const ids = await this.resolveAudienceContactIds(orgId, (dto.filters ?? []) as AudienceFilter[]);
    const sample = ids.length
      ? await this.contactRepo.find({
          where: { id: In(ids.slice(0, 5)), organizationId: orgId ?? undefined },
        })
      : [];
    return { estimatedSize: ids.length, sample };
  }

  private async resolveAudienceContactIds(
    orgId: string | null,
    filters: AudienceFilter[],
  ): Promise<string[]> {
    const qb = this.contactRepo.createQueryBuilder('c').select('c.id');
    if (orgId) qb.where('c.organizationId = :orgId', { orgId });
    let idx = 0;
    for (const f of filters) {
      idx++;
      const p = `p${idx}`;
      if (f.field === 'label' && f.operator === 'in' && Array.isArray(f.value)) {
        qb.andWhere(`string_to_array(c.labels, ',') && :${p}::varchar[]`, { [p]: f.value });
      } else if (f.field === 'email' && f.operator === 'contains') {
        qb.andWhere(`LOWER(c.email) LIKE :${p}`, { [p]: `%${String(f.value).toLowerCase()}%` });
      } else if (f.field === 'createdAt' && f.operator === 'gt') {
        qb.andWhere(`c.createdAt > :${p}`, { [p]: f.value });
      } else if (f.field === 'orgCompanyId' && f.operator === 'eq') {
        qb.andWhere(`c.orgCompanyId = :${p}`, { [p]: f.value });
      }
    }
    const rows = await qb.getMany();
    return rows.map((r) => r.id);
  }

  // ────── Recommendations ──────
  async listRecommendations(orgId: string | null): Promise<MarketingRecommendation[]> {
    return this.recRepo.find({
      where: orgId ? { organizationId: orgId, status: 'PENDING' } : { status: 'PENDING' },
      order: { createdAt: 'DESC' },
    });
  }

  async generateRecommendations(orgId: string | null): Promise<MarketingRecommendation[]> {
    if (!orgId) throw new BadRequestException('Organization is required');
    const contactCount = await this.contactRepo.count({ where: { organizationId: orgId } });
    const items: Array<{ type: RecommendationType; title: string; description: string; impact: number }> = [
      {
        type: 'REACTIVATE_INACTIVE',
        title: 'Reativar contatos inativos',
        description: `${Math.floor(contactCount * 0.3)} contatos sem atividade nos últimos 30 dias podem receber uma campanha de reengajamento.`,
        impact: Math.floor(contactCount * 0.3),
      },
      {
        type: 'FOLLOWUP_STALE_DEAL',
        title: 'Acompanhar negócios parados',
        description: 'Negócios em mesmo estágio há mais de 14 dias podem se beneficiar de um follow-up automatizado.',
        impact: 5,
      },
      {
        type: 'WELCOME_NEW',
        title: 'Boas-vindas para novos contatos',
        description: 'Configure uma sequência de boas-vindas para contatos criados na última semana.',
        impact: Math.floor(contactCount * 0.05),
      },
      {
        type: 'UPSELL',
        title: 'Upsell para clientes ativos',
        description: 'Identifique clientes em uso ativo e ofereça pacotes premium.',
        impact: 10,
      },
    ];
    const saved = await this.recRepo.save(
      items.map((it) =>
        this.recRepo.create({
          organizationId: orgId,
          type: it.type,
          title: it.title,
          description: it.description,
          estimatedImpact: it.impact,
          status: 'PENDING',
          payload: {},
        }),
      ),
    );
    return saved;
  }

  async setRecommendationStatus(
    id: string,
    orgId: string | null,
    status: 'ACCEPTED' | 'DISMISSED',
  ) {
    const r = await this.recRepo.findOne({
      where: { id, organizationId: orgId ?? undefined },
    });
    if (!r) throw new NotFoundException('Recommendation not found');
    r.status = status;
    return this.recRepo.save(r);
  }

  // ────── Settings ──────
  async getSettings(orgId: string | null): Promise<MarketingSettings> {
    if (!orgId) throw new BadRequestException('Organization is required');
    let s = await this.settingsRepo.findOne({ where: { organizationId: orgId } });
    if (!s) {
      s = this.settingsRepo.create({
        organizationId: orgId,
        unsubscribeUrl: `https://oxlify.com/unsubscribe/${orgId}`,
      });
      s = await this.settingsRepo.save(s);
    }
    return s;
  }

  async updateSettings(orgId: string | null, dto: UpdateMarketingSettingsDto) {
    const s = await this.getSettings(orgId);
    Object.assign(s, dto);
    return this.settingsRepo.save(s);
  }
}
