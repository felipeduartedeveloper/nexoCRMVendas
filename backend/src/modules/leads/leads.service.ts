import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Lead, LeadStatus } from './lead.entity';
import { Deal, DealStatus } from '../deals/deal.entity';
import { Pipeline } from '../pipelines/pipeline.entity';
import { Stage } from '../pipelines/stage.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead) private readonly repo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Pipeline) private readonly pipelineRepo: Repository<Pipeline>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    private readonly ds: DataSource,
  ) {}

  async list(
    orgId: string | null,
    p: PaginationDto,
    status?: LeadStatus,
  ): Promise<PaginatedResult<Lead>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.repo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC');
    if (orgId) qb.where('l.organizationId = :orgId', { orgId });
    if (status) qb.andWhere('l.status = :status', { status });
    if (p.search) {
      qb.andWhere('LOWER(l.title) LIKE :s', { s: `%${p.search.toLowerCase()}%` });
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async findById(id: string, orgId: string | null): Promise<Lead> {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const l = await this.repo.findOne({ where });
    if (!l) throw new NotFoundException('Lead not found');
    return l;
  }

  async create(orgId: string | null, ownerUserId: string, dto: CreateLeadDto): Promise<Lead> {
    if (!orgId) throw new BadRequestException('Organization is required');
    const l = this.repo.create({
      ...dto,
      value: dto.value ?? 0,
      currency: dto.currency ?? 'USD',
      status: dto.status ?? LeadStatus.INBOX,
      organizationId: orgId,
      ownerUserId: dto.ownerUserId ?? ownerUserId,
    });
    return this.repo.save(l);
  }

  async update(id: string, orgId: string | null, dto: UpdateLeadDto): Promise<Lead> {
    const l = await this.findById(id, orgId);
    Object.assign(l, dto);
    return this.repo.save(l);
  }

  async archive(id: string, orgId: string | null): Promise<Lead> {
    const l = await this.findById(id, orgId);
    l.status = LeadStatus.ARCHIVED;
    return this.repo.save(l);
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const l = await this.findById(id, orgId);
    await this.repo.remove(l);
  }

  async convert(
    id: string,
    orgId: string | null,
    ownerUserId: string,
    dto: ConvertLeadDto,
  ): Promise<Deal> {
    if (!orgId) throw new BadRequestException('Organization is required');
    return this.ds.transaction(async (tx) => {
      const lead = await tx.getRepository(Lead).findOne({
        where: { id, organizationId: orgId },
      });
      if (!lead) throw new NotFoundException('Lead not found');
      if (lead.status === LeadStatus.CONVERTED && lead.convertedDealId) {
        throw new BadRequestException('Lead already converted');
      }

      let pipeline: Pipeline | null = null;
      if (dto.pipelineId) {
        pipeline = await tx.getRepository(Pipeline).findOne({
          where: { id: dto.pipelineId, organizationId: orgId },
        });
      } else {
        pipeline = await tx.getRepository(Pipeline).findOne({
          where: { organizationId: orgId, isDefault: true },
        });
      }
      if (!pipeline) throw new NotFoundException('Pipeline not found');

      let stage: Stage | null = null;
      if (dto.stageId) {
        stage = await tx.getRepository(Stage).findOne({
          where: { id: dto.stageId, pipelineId: pipeline.id },
        });
      } else {
        stage = await tx.getRepository(Stage).findOne({
          where: { pipelineId: pipeline.id },
          order: { orderIndex: 'ASC' },
        });
      }
      if (!stage) throw new NotFoundException('Stage not found in pipeline');

      const lastIndex = await tx
        .getRepository(Deal)
        .createQueryBuilder('d')
        .select('MAX(d.stageOrderIndex)', 'max')
        .where('d.stageId = :stageId', { stageId: stage.id })
        .getRawOne();

      const deal = tx.getRepository(Deal).create({
        title: lead.title,
        value: lead.value,
        currency: lead.currency,
        pipelineId: pipeline.id,
        stageId: stage.id,
        stageOrderIndex: (lastIndex?.max ?? -1) + 1,
        organizationId: orgId,
        ownerUserId: lead.ownerUserId ?? ownerUserId,
        contactId: lead.contactId,
        orgCompanyId: lead.orgCompanyId,
        status: DealStatus.OPEN,
        labels: lead.labels,
        notes: lead.notes,
        isSample: false,
      });
      const savedDeal = await tx.getRepository(Deal).save(deal);

      lead.status = LeadStatus.CONVERTED;
      lead.convertedDealId = savedDeal.id;
      await tx.getRepository(Lead).save(lead);

      return savedDeal;
    });
  }

  async counters(orgId: string | null) {
    const qb = this.repo.createQueryBuilder('l');
    if (orgId) qb.where('l.organizationId = :orgId', { orgId });
    const [inbox, working, archived, converted] = await Promise.all([
      qb.clone().andWhere('l.status = :s', { s: LeadStatus.INBOX }).getCount(),
      qb.clone().andWhere('l.status = :s', { s: LeadStatus.WORKING }).getCount(),
      qb.clone().andWhere('l.status = :s', { s: LeadStatus.ARCHIVED }).getCount(),
      qb.clone().andWhere('l.status = :s', { s: LeadStatus.CONVERTED }).getCount(),
    ]);
    return { inbox, working, archived, converted };
  }
}
