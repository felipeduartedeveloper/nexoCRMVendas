import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStatus } from './lead.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  constructor(@InjectRepository(Lead) private readonly repo: Repository<Lead>) {}

  async list(orgId: string | null, p: PaginationDto, status?: LeadStatus): Promise<PaginatedResult<Lead>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.repo.createQueryBuilder('l').orderBy('l.createdAt', 'DESC');
    if (orgId) qb.where('l.organizationId = :orgId', { orgId });
    if (status) qb.andWhere('l.status = :status', { status });
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }
}
