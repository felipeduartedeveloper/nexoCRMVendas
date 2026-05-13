import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LostReason } from './lost-reason.entity';

@Injectable()
export class LostReasonsService {
  constructor(@InjectRepository(LostReason) private readonly repo: Repository<LostReason>) {}

  list(orgId: string | null) {
    return this.repo.find({
      where: orgId ? { organizationId: orgId } : {},
      order: { name: 'ASC' },
    });
  }

  async create(orgId: string | null, dto: { name: string }) {
    if (!orgId) throw new BadRequestException('Organization required');
    return this.repo.save(this.repo.create({ ...dto, organizationId: orgId }));
  }

  async update(id: string, orgId: string | null, dto: Partial<LostReason>) {
    const l = await this.repo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!l) throw new NotFoundException('Lost reason not found');
    Object.assign(l, dto);
    return this.repo.save(l);
  }

  async remove(id: string, orgId: string | null) {
    const l = await this.repo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!l) throw new NotFoundException('Lost reason not found');
    await this.repo.remove(l);
  }
}
