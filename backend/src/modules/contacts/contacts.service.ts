import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { OrgCompany } from './org-company.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private readonly repo: Repository<Contact>,
    @InjectRepository(OrgCompany) private readonly orgRepo: Repository<OrgCompany>,
  ) {}

  async list(orgId: string | null, p: PaginationDto): Promise<PaginatedResult<Contact>> {
    const page = p.page ?? 1;
    const limit = p.limit ?? 50;
    const qb = this.repo.createQueryBuilder('c').orderBy('c.createdAt', 'DESC');
    if (orgId) qb.where('c.organizationId = :orgId', { orgId });
    if (p.search) {
      qb.andWhere('(LOWER(c.name) LIKE :s OR LOWER(c.email) LIKE :s)', {
        s: `%${p.search.toLowerCase()}%`,
      });
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

  listCompanies(orgId: string | null) {
    return this.orgRepo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
