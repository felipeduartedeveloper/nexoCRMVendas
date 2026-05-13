import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization, OrganizationPlan, OrganizationStatus } from './organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly repo: Repository<Organization>,
  ) {}

  private slugify(name: string): string {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    return base || 'org';
  }

  private async uniqueSlug(name: string): Promise<string> {
    const base = this.slugify(name);
    let slug = base;
    let i = 2;
    while (await this.repo.findOne({ where: { slug } })) {
      slug = `${base}-${i++}`;
      if (i > 999) {
        slug = `${base}-${Date.now()}`;
        break;
      }
    }
    return slug;
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const slug = await this.uniqueSlug(dto.name);
    const org = this.repo.create({
      ...dto,
      slug,
      plan: dto.plan ?? OrganizationPlan.TRIAL,
      status: dto.status ?? OrganizationStatus.ACTIVE,
      maxUsers: dto.maxUsers ?? 5,
    });
    return this.repo.save(org);
  }

  async findById(id: string): Promise<Organization> {
    const org = await this.repo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async update(id: string, patch: Partial<Organization>): Promise<Organization> {
    const org = await this.findById(id);
    Object.assign(org, patch);
    return this.repo.save(org);
  }

  async list(pagination: PaginationDto): Promise<PaginatedResult<Organization>> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const qb = this.repo.createQueryBuilder('o').orderBy('o.createdAt', 'DESC');
    if (pagination.search) {
      qb.where('(LOWER(o.name) LIKE :s OR LOWER(o.slug) LIKE :s)', {
        s: `%${pagination.search.toLowerCase()}%`,
      });
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }
}
