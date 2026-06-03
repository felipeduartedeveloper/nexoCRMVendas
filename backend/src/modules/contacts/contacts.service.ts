import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { OrgCompany } from './org-company.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private readonly repo: Repository<Contact>,
    @InjectRepository(OrgCompany) private readonly orgRepo: Repository<OrgCompany>,
  ) {}

  // ────── Contacts ──────

  async list(
    orgId: string | null,
    p: PaginationDto,
    actor?: { role?: string; sub?: string },
  ): Promise<PaginatedResult<Contact>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC');
    if (orgId) qb.where('c.organizationId = :orgId', { orgId });
    // Vendedor isolado (SALES) só vê os próprios contatos.
    if (actor?.role === 'SALES' && actor.sub) {
      qb.andWhere('c.ownerUserId = :__owner', { __owner: actor.sub });
    }
    if (p.search) {
      qb.andWhere(
        '(LOWER(c.name) LIKE :s OR LOWER(c.email) LIKE :s OR LOWER(c.phone) LIKE :s)',
        { s: `%${p.search.toLowerCase()}%` },
      );
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async findById(id: string, orgId: string | null): Promise<Contact> {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const c = await this.repo.findOne({ where });
    if (!c) throw new NotFoundException('Contact not found');
    return c;
  }

  async create(orgId: string | null, ownerUserId: string, dto: CreateContactDto): Promise<Contact> {
    if (!orgId) throw new BadRequestException('Organization is required');
    if (dto.orgCompanyId) await this.assertCompanyExists(dto.orgCompanyId, orgId);
    const c = this.repo.create({
      ...dto,
      organizationId: orgId,
      ownerUserId: dto.ownerUserId ?? ownerUserId,
      isSample: false,
    });
    return this.repo.save(c);
  }

  async update(id: string, orgId: string | null, dto: UpdateContactDto): Promise<Contact> {
    const c = await this.findById(id, orgId);
    if (dto.orgCompanyId) await this.assertCompanyExists(dto.orgCompanyId, orgId);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async delete(id: string, orgId: string | null): Promise<void> {
    const c = await this.findById(id, orgId);
    await this.repo.remove(c);
  }

  async bulkDelete(ids: string[], orgId: string | null): Promise<number> {
    if (!ids.length) return 0;
    const where: any = { id: In(ids) };
    if (orgId) where.organizationId = orgId;
    const res = await this.repo.delete(where);
    return res.affected ?? 0;
  }

  async timeline(orgId: string | null, limit = 100) {
    const qb = this.repo
      .createQueryBuilder('c')
      .orderBy('c.updatedAt', 'DESC')
      .take(limit);
    if (orgId) qb.where('c.organizationId = :orgId', { orgId });
    return qb.getMany();
  }

  async findDuplicates(orgId: string | null) {
    if (!orgId) return [];
    const groups = await this.repo
      .createQueryBuilder('c')
      .select('LOWER(c.email)', 'key')
      .addSelect('COUNT(*)', 'count')
      .addSelect('ARRAY_AGG(c.id::text)', 'ids')
      .where('c.organizationId = :orgId', { orgId })
      .andWhere('c.email IS NOT NULL')
      .groupBy('LOWER(c.email)')
      .having('COUNT(*) > 1')
      .getRawMany();
    return groups.map((g) => ({
      email: g.key,
      count: Number(g.count),
      contactIds: g.ids,
    }));
  }

  async merge(targetId: string, sourceIds: string[], orgId: string | null): Promise<Contact> {
    const target = await this.findById(targetId, orgId);
    const sources = await this.repo.find({
      where: sourceIds.map((id) => ({ id, organizationId: orgId ?? undefined })) as any,
    });
    if (sources.length !== sourceIds.length) {
      throw new NotFoundException('Some contacts not found');
    }
    const labels = new Set<string>(target.labels ?? []);
    sources.forEach((s) => (s.labels ?? []).forEach((l) => labels.add(l)));
    target.labels = Array.from(labels);
    target.jobTitle = target.jobTitle || sources.find((s) => s.jobTitle)?.jobTitle || null;
    target.phone = target.phone || sources.find((s) => s.phone)?.phone || null;
    target.orgCompanyId =
      target.orgCompanyId || sources.find((s) => s.orgCompanyId)?.orgCompanyId || null;
    await this.repo.save(target);
    await this.repo.remove(sources);
    return target;
  }

  // ────── Companies (org_companies) ──────

  async listCompanies(
    orgId: string | null,
    p: PaginationDto,
  ): Promise<PaginatedResult<OrgCompany>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.orgRepo.createQueryBuilder('o').orderBy('o.createdAt', 'DESC');
    if (orgId) qb.where('o.organizationId = :orgId', { orgId });
    if (p.search) {
      qb.andWhere(
        '(LOWER(o.name) LIKE :s OR LOWER(o.website) LIKE :s)',
        { s: `%${p.search.toLowerCase()}%` },
      );
    }
    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) || 1 };
  }

  async findCompanyById(id: string, orgId: string | null): Promise<OrgCompany> {
    const where: any = { id };
    if (orgId) where.organizationId = orgId;
    const c = await this.orgRepo.findOne({ where });
    if (!c) throw new NotFoundException('Company not found');
    return c;
  }

  async createCompany(
    orgId: string | null,
    ownerUserId: string,
    dto: CreateCompanyDto,
  ): Promise<OrgCompany> {
    if (!orgId) throw new BadRequestException('Organization is required');
    const c = this.orgRepo.create({
      ...dto,
      organizationId: orgId,
      ownerUserId: dto.ownerUserId ?? ownerUserId,
    });
    return this.orgRepo.save(c);
  }

  async updateCompany(
    id: string,
    orgId: string | null,
    dto: UpdateCompanyDto,
  ): Promise<OrgCompany> {
    const c = await this.findCompanyById(id, orgId);
    Object.assign(c, dto);
    return this.orgRepo.save(c);
  }

  async deleteCompany(id: string, orgId: string | null): Promise<void> {
    const c = await this.findCompanyById(id, orgId);
    await this.repo.update({ orgCompanyId: id }, { orgCompanyId: null });
    await this.orgRepo.remove(c);
  }

  private async assertCompanyExists(id: string, orgId: string | null) {
    const c = await this.orgRepo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!c) throw new NotFoundException('Company not found');
  }
}
