import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Deal, DealStatus } from './deal.entity';
import { Stage } from '../pipelines/stage.entity';
import { Pipeline } from '../pipelines/pipeline.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { MoveDealDto } from './dto/move-deal.dto';
import { LoseDealDto } from './dto/lose-deal.dto';

export interface DealFilters {
  status?: DealStatus;
  pipelineId?: string;
  stageId?: string;
  ownerUserId?: string;
  contactId?: string;
  orgCompanyId?: string;
}

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal) private readonly repo: Repository<Deal>,
    @InjectRepository(Stage) private readonly stages: Repository<Stage>,
    @InjectRepository(Pipeline) private readonly pipelines: Repository<Pipeline>,
    private readonly ds: DataSource,
  ) {}

  async list(
    orgId: string | null,
    p: PaginationDto,
    f: DealFilters = {},
  ): Promise<PaginatedResult<Deal>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 100;
    const qb = this.repo
      .createQueryBuilder('d')
      .orderBy('d.stageOrderIndex', 'ASC')
      .addOrderBy('d.createdAt', 'DESC');
    if (orgId) qb.where('d.organizationId = :orgId', { orgId });
    if (f.status) qb.andWhere('d.status = :status', { status: f.status });
    if (f.pipelineId) qb.andWhere('d.pipelineId = :pipelineId', { pipelineId: f.pipelineId });
    if (f.stageId) qb.andWhere('d.stageId = :stageId', { stageId: f.stageId });
    if (f.ownerUserId) qb.andWhere('d.ownerUserId = :owner', { owner: f.ownerUserId });
    if (f.contactId) qb.andWhere('d.contactId = :contactId', { contactId: f.contactId });
    if (f.orgCompanyId) qb.andWhere('d.orgCompanyId = :orgCompanyId', { orgCompanyId: f.orgCompanyId });
    if (p.search) {
      qb.andWhere('LOWER(d.title) LIKE :s', { s: `%${p.search.toLowerCase()}%` });
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async kanban(orgId: string | null, pipelineId: string) {
    const qb = this.repo
      .createQueryBuilder('d')
      .where('d.pipelineId = :pipelineId', { pipelineId })
      .andWhere('d.status = :s', { s: DealStatus.OPEN })
      .orderBy('d.stageOrderIndex', 'ASC');
    if (orgId) qb.andWhere('d.organizationId = :orgId', { orgId });
    return qb.getMany();
  }

  async findById(id: string, orgId: string | null): Promise<Deal> {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const d = await this.repo.findOne({ where });
    if (!d) throw new NotFoundException('Deal not found');
    return d;
  }

  async create(orgId: string | null, ownerUserId: string, dto: CreateDealDto): Promise<Deal> {
    if (!orgId) throw new BadRequestException('Organization is required');
    await this.assertStage(dto.stageId, dto.pipelineId, orgId);
    const lastIndex = await this.repo
      .createQueryBuilder('d')
      .select('MAX(d.stageOrderIndex)', 'max')
      .where('d.stageId = :stageId AND d.organizationId = :orgId', {
        stageId: dto.stageId,
        orgId,
      })
      .getRawOne<{ max: number | null }>();
    const nextIndex = (lastIndex?.max ?? -1) + 1;
    const d = this.repo.create({
      ...dto,
      value: dto.value ?? 0,
      currency: dto.currency ?? 'USD',
      organizationId: orgId,
      ownerUserId: dto.ownerUserId ?? ownerUserId,
      status: DealStatus.OPEN,
      stageOrderIndex: nextIndex,
      expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
      isSample: false,
    });
    return this.repo.save(d);
  }

  async update(id: string, orgId: string | null, dto: UpdateDealDto): Promise<Deal> {
    const d = await this.findById(id, orgId);
    if (dto.stageId && dto.stageId !== d.stageId) {
      await this.assertStage(dto.stageId, dto.pipelineId ?? d.pipelineId, orgId);
    }
    Object.assign(d, dto, {
      expectedCloseDate: dto.expectedCloseDate
        ? new Date(dto.expectedCloseDate)
        : d.expectedCloseDate,
    });
    return this.repo.save(d);
  }

  async move(id: string, orgId: string | null, dto: MoveDealDto): Promise<Deal> {
    return this.ds.transaction(async (tx) => {
      const deal = await tx.getRepository(Deal).findOne({
        where: orgId ? { id, organizationId: orgId } : { id },
      });
      if (!deal) throw new NotFoundException('Deal not found');
      const stage = await tx.getRepository(Stage).findOne({
        where: { id: dto.stageId, pipelineId: deal.pipelineId },
      });
      if (!stage) throw new NotFoundException('Stage not found in this pipeline');

      const newIndex = dto.stageOrderIndex ?? Number.MAX_SAFE_INTEGER;

      // shift other deals in target stage to open space at newIndex
      await tx
        .getRepository(Deal)
        .createQueryBuilder()
        .update(Deal)
        .set({ stageOrderIndex: () => '"stageOrderIndex" + 1' })
        .where('"stageId" = :stageId', { stageId: dto.stageId })
        .andWhere('"stageOrderIndex" >= :idx', { idx: newIndex })
        .andWhere('id != :id', { id: deal.id })
        .execute();

      deal.stageId = dto.stageId;
      deal.stageOrderIndex = newIndex === Number.MAX_SAFE_INTEGER ? await this.nextIndex(tx, dto.stageId) : newIndex;
      if (stage.isWon) {
        deal.status = DealStatus.WON;
        deal.wonAt = new Date();
      } else if (stage.isLost) {
        deal.status = DealStatus.LOST;
        deal.lostAt = new Date();
      } else if (deal.status !== DealStatus.OPEN) {
        deal.status = DealStatus.OPEN;
        deal.wonAt = null;
        deal.lostAt = null;
      }
      return tx.getRepository(Deal).save(deal);
    });
  }

  async win(id: string, orgId: string | null): Promise<Deal> {
    const d = await this.findById(id, orgId);
    d.status = DealStatus.WON;
    d.wonAt = new Date();
    d.lostAt = null;
    return this.repo.save(d);
  }

  async lose(id: string, orgId: string | null, dto: LoseDealDto): Promise<Deal> {
    const d = await this.findById(id, orgId);
    d.status = DealStatus.LOST;
    d.lostAt = new Date();
    d.wonAt = null;
    if (dto.reason) d.notes = `${d.notes ? d.notes + '\n' : ''}Lost reason: ${dto.reason}`;
    return this.repo.save(d);
  }

  async reopen(id: string, orgId: string | null): Promise<Deal> {
    const d = await this.findById(id, orgId);
    d.status = DealStatus.OPEN;
    d.wonAt = null;
    d.lostAt = null;
    return this.repo.save(d);
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const d = await this.findById(id, orgId);
    d.status = DealStatus.DELETED;
    await this.repo.save(d);
  }

  async hardDelete(id: string, orgId: string | null): Promise<void> {
    const d = await this.findById(id, orgId);
    await this.repo.remove(d);
  }

  async summary(orgId: string | null, pipelineId: string) {
    if (!orgId) return [];
    const rows = await this.repo
      .createQueryBuilder('d')
      .select('d.stageId', 'stageId')
      .addSelect('COUNT(d.id)', 'count')
      .addSelect('SUM(d.value)', 'total')
      .where('d.organizationId = :orgId AND d.pipelineId = :p AND d.status = :s', {
        orgId,
        p: pipelineId,
        s: DealStatus.OPEN,
      })
      .groupBy('d.stageId')
      .getRawMany<{ stageId: string; count: string; total: string }>();
    return rows.map((r) => ({
      stageId: r.stageId,
      count: Number(r.count),
      total: Number(r.total ?? 0),
    }));
  }

  private async assertStage(stageId: string, pipelineId: string, orgId: string | null) {
    const s = await this.stages.findOne({ where: { id: stageId, pipelineId } });
    if (!s) throw new BadRequestException('Stage does not belong to pipeline');
    const p = await this.pipelines.findOne({
      where: orgId ? { id: pipelineId, organizationId: orgId } : { id: pipelineId },
    });
    if (!p) throw new BadRequestException('Pipeline not found');
  }

  private async nextIndex(tx: any, stageId: string): Promise<number> {
    const row = await tx
      .getRepository(Deal)
      .createQueryBuilder('d')
      .select('MAX(d.stageOrderIndex)', 'max')
      .where('d.stageId = :stageId', { stageId })
      .getRawOne<{ max: number | null }>();
    return (row?.max ?? -1) + 1;
  }
}
