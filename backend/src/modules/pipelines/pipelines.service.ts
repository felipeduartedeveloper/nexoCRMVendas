import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Pipeline } from './pipeline.entity';
import { Stage } from './stage.entity';
import { Deal, DealStatus } from '../deals/deal.entity';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ReorderDto } from './dto/reorder.dto';

@Injectable()
export class PipelinesService {
  constructor(
    @InjectRepository(Pipeline) private readonly repo: Repository<Pipeline>,
    @InjectRepository(Stage) private readonly stageRepo: Repository<Stage>,
    @InjectRepository(Deal) private readonly dealRepo: Repository<Deal>,
    private readonly ds: DataSource,
  ) {}

  async list(orgId: string | null) {
    const pipelines = await this.repo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { orderIndex: 'ASC' },
    });
    const ids = pipelines.map((p) => p.id);
    const stages = ids.length
      ? await this.stageRepo.find({
          where: { pipelineId: In(ids) },
          order: { orderIndex: 'ASC' },
        })
      : [];
    return pipelines.map((p) => ({
      ...p,
      stages: stages.filter((s) => s.pipelineId === p.id),
    }));
  }

  async findById(id: string, orgId: string | null) {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const p = await this.repo.findOne({ where });
    if (!p) throw new NotFoundException('Pipeline not found');
    return p;
  }

  async create(orgId: string | null, dto: CreatePipelineDto): Promise<Pipeline> {
    if (!orgId) throw new BadRequestException('Organization is required');
    return this.ds.transaction(async (tx) => {
      if (dto.isDefault) {
        await tx
          .getRepository(Pipeline)
          .update({ organizationId: orgId, isDefault: true }, { isDefault: false });
      }
      const lastIndex = await tx
        .getRepository(Pipeline)
        .createQueryBuilder('p')
        .select('MAX(p.orderIndex)', 'max')
        .where('p.organizationId = :orgId', { orgId })
        .getRawOne();
      const p = tx.getRepository(Pipeline).create({
        name: dto.name,
        currency: dto.currency ?? 'USD',
        isDefault: dto.isDefault ?? false,
        orderIndex: dto.orderIndex ?? (lastIndex?.max ?? -1) + 1,
        organizationId: orgId,
      });
      return tx.getRepository(Pipeline).save(p);
    });
  }

  async update(id: string, orgId: string | null, dto: UpdatePipelineDto): Promise<Pipeline> {
    return this.ds.transaction(async (tx) => {
      const p = await tx
        .getRepository(Pipeline)
        .findOne({ where: orgId ? { id, organizationId: orgId } : { id } });
      if (!p) throw new NotFoundException('Pipeline not found');
      if (dto.isDefault === true && !p.isDefault) {
        await tx
          .getRepository(Pipeline)
          .update({ organizationId: orgId ?? undefined, isDefault: true }, { isDefault: false });
      }
      Object.assign(p, dto);
      return tx.getRepository(Pipeline).save(p);
    });
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const p = await this.findById(id, orgId);
    const dealsCount = await this.dealRepo.count({
      where: { pipelineId: id, status: DealStatus.OPEN },
    });
    if (dealsCount > 0) {
      throw new ConflictException(
        `Pipeline has ${dealsCount} open deals. Move or close them before deleting.`,
      );
    }
    await this.stageRepo.delete({ pipelineId: id });
    await this.repo.remove(p);
  }

  async reorder(orgId: string | null, dto: ReorderDto) {
    await this.ds.transaction(async (tx) => {
      for (let i = 0; i < dto.ids.length; i++) {
        await tx
          .getRepository(Pipeline)
          .update(
            { id: dto.ids[i], organizationId: orgId ?? undefined },
            { orderIndex: i },
          );
      }
    });
    return this.list(orgId);
  }

  async stagesByPipeline(pipelineId: string, orgId: string | null) {
    await this.findById(pipelineId, orgId);
    return this.stageRepo.find({ where: { pipelineId }, order: { orderIndex: 'ASC' } });
  }

  async createStage(pipelineId: string, orgId: string | null, dto: CreateStageDto): Promise<Stage> {
    await this.findById(pipelineId, orgId);
    const lastIndex = await this.stageRepo
      .createQueryBuilder('s')
      .select('MAX(s.orderIndex)', 'max')
      .where('s.pipelineId = :pipelineId', { pipelineId })
      .getRawOne();
    const s = this.stageRepo.create({
      ...dto,
      pipelineId,
      organizationId: orgId,
      orderIndex: dto.orderIndex ?? (lastIndex?.max ?? -1) + 1,
    });
    return this.stageRepo.save(s);
  }

  async updateStage(id: string, orgId: string | null, dto: UpdateStageDto): Promise<Stage> {
    const s = await this.stageRepo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!s) throw new NotFoundException('Stage not found');
    Object.assign(s, dto);
    return this.stageRepo.save(s);
  }

  async deleteStage(id: string, orgId: string | null): Promise<void> {
    const s = await this.stageRepo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!s) throw new NotFoundException('Stage not found');
    const dealsCount = await this.dealRepo.count({
      where: { stageId: id, status: DealStatus.OPEN },
    });
    if (dealsCount > 0) {
      throw new ConflictException(
        `Stage has ${dealsCount} open deals. Move them before deleting.`,
      );
    }
    await this.stageRepo.remove(s);
  }

  async reorderStages(pipelineId: string, orgId: string | null, dto: ReorderDto) {
    await this.findById(pipelineId, orgId);
    await this.ds.transaction(async (tx) => {
      for (let i = 0; i < dto.ids.length; i++) {
        await tx
          .getRepository(Stage)
          .update({ id: dto.ids[i], pipelineId }, { orderIndex: i });
      }
    });
    return this.stagesByPipeline(pipelineId, orgId);
  }
}
