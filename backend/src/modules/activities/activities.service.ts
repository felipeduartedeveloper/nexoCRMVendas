import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ActivitiesService {
  constructor(@InjectRepository(Activity) private readonly repo: Repository<Activity>) {}

  async list(orgId: string | null, p: PaginationDto): Promise<PaginatedResult<Activity>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.repo.createQueryBuilder('a').orderBy('a.dueAt', 'ASC', 'NULLS LAST');
    if (orgId) qb.where('a.organizationId = :orgId', { orgId });
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }
}
