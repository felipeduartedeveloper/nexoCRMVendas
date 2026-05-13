import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityType } from './activity.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

export interface ActivityFilters {
  done?: boolean;
  type?: ActivityType;
  dealId?: string;
  contactId?: string;
  ownerUserId?: string;
  scope?: 'overdue' | 'today' | 'upcoming' | 'all';
}

@Injectable()
export class ActivitiesService {
  constructor(@InjectRepository(Activity) private readonly repo: Repository<Activity>) {}

  async list(
    orgId: string | null,
    p: PaginationDto,
    f: ActivityFilters = {},
  ): Promise<PaginatedResult<Activity>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.repo.createQueryBuilder('a').orderBy('a.dueAt', 'ASC', 'NULLS LAST');
    if (orgId) qb.where('a.organizationId = :orgId', { orgId });
    if (typeof f.done === 'boolean') qb.andWhere('a.done = :done', { done: f.done });
    if (f.type) qb.andWhere('a.type = :type', { type: f.type });
    if (f.dealId) qb.andWhere('a.dealId = :dealId', { dealId: f.dealId });
    if (f.contactId) qb.andWhere('a.contactId = :contactId', { contactId: f.contactId });
    if (f.ownerUserId) qb.andWhere('a.ownerUserId = :owner', { owner: f.ownerUserId });
    if (p.search) {
      qb.andWhere('LOWER(a.subject) LIKE :s', { s: `%${p.search.toLowerCase()}%` });
    }
    if (f.scope && f.scope !== 'all') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      if (f.scope === 'overdue') {
        qb.andWhere('a.dueAt < :start AND a.done = false', { start: startOfDay });
      } else if (f.scope === 'today') {
        qb.andWhere('a.dueAt >= :start AND a.dueAt < :end', {
          start: startOfDay,
          end: endOfDay,
        });
      } else if (f.scope === 'upcoming') {
        qb.andWhere('a.dueAt >= :end', { end: endOfDay });
      }
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async findById(id: string, orgId: string | null): Promise<Activity> {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const a = await this.repo.findOne({ where });
    if (!a) throw new NotFoundException('Activity not found');
    return a;
  }

  async create(orgId: string | null, ownerUserId: string, dto: CreateActivityDto): Promise<Activity> {
    if (!orgId) throw new BadRequestException('Organization is required');
    const a = this.repo.create({
      ...dto,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      organizationId: orgId,
      ownerUserId: dto.ownerUserId ?? ownerUserId,
      isSample: false,
    });
    return this.repo.save(a);
  }

  async update(id: string, orgId: string | null, dto: UpdateActivityDto): Promise<Activity> {
    const a = await this.findById(id, orgId);
    Object.assign(a, dto, dto.dueAt ? { dueAt: new Date(dto.dueAt) } : {});
    return this.repo.save(a);
  }

  async markDone(id: string, orgId: string | null, done = true): Promise<Activity> {
    const a = await this.findById(id, orgId);
    a.done = done;
    return this.repo.save(a);
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const a = await this.findById(id, orgId);
    await this.repo.remove(a);
  }

  async byDeal(dealId: string, orgId: string | null) {
    const where: any = { dealId };
    if (orgId) where.organizationId = orgId;
    return this.repo.find({ where, order: { dueAt: 'ASC' } });
  }

  async byContact(contactId: string, orgId: string | null) {
    const where: any = { contactId };
    if (orgId) where.organizationId = orgId;
    return this.repo.find({ where, order: { dueAt: 'ASC' } });
  }

  async counters(orgId: string | null) {
    const qb = this.repo.createQueryBuilder('a');
    if (orgId) qb.where('a.organizationId = :orgId', { orgId });
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const [overdue, today, upcoming, doneCount] = await Promise.all([
      qb.clone().andWhere('a.dueAt < :start AND a.done = false', { start: startOfDay }).getCount(),
      qb
        .clone()
        .andWhere('a.dueAt >= :start AND a.dueAt < :end', { start: startOfDay, end: endOfDay })
        .getCount(),
      qb.clone().andWhere('a.dueAt >= :end', { end: endOfDay }).getCount(),
      qb.clone().andWhere('a.done = true').getCount(),
    ]);
    return { overdue, today, upcoming, done: doneCount };
  }
}
