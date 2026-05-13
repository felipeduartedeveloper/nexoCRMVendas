import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal } from './deal.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class DealsService {
  constructor(@InjectRepository(Deal) private readonly repo: Repository<Deal>) {}

  async list(orgId: string | null, p: PaginationDto): Promise<PaginatedResult<Deal>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 100;
    const qb = this.repo
      .createQueryBuilder('d')
      .orderBy('d.stageOrderIndex', 'ASC')
      .addOrderBy('d.createdAt', 'DESC');
    if (orgId) qb.where('d.organizationId = :orgId', { orgId });
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async kanban(orgId: string | null, pipelineId: string) {
    const qb = this.repo
      .createQueryBuilder('d')
      .where('d.pipelineId = :pipelineId', { pipelineId })
      .orderBy('d.stageOrderIndex', 'ASC');
    if (orgId) qb.andWhere('d.organizationId = :orgId', { orgId });
    return qb.getMany();
  }
}
