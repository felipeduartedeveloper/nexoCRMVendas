import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Label, LabelEntityType } from './label.entity';

@Injectable()
export class LabelsService {
  constructor(@InjectRepository(Label) private readonly repo: Repository<Label>) {}

  async list(orgId: string | null, entityType?: LabelEntityType) {
    const where: any = {};
    if (orgId) where.organizationId = orgId;
    if (entityType) where.entityType = entityType;
    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async create(
    orgId: string | null,
    dto: { name: string; color?: string; entityType?: LabelEntityType },
  ) {
    if (!orgId) throw new BadRequestException('Organization required');
    const l = this.repo.create({
      ...dto,
      color: dto.color ?? '#3b82f6',
      organizationId: orgId,
      entityType: dto.entityType ?? LabelEntityType.DEAL,
    });
    return this.repo.save(l);
  }

  async update(id: string, orgId: string | null, dto: Partial<Label>) {
    const l = await this.repo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!l) throw new NotFoundException('Label not found');
    Object.assign(l, dto);
    return this.repo.save(l);
  }

  async remove(id: string, orgId: string | null) {
    const l = await this.repo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!l) throw new NotFoundException('Label not found');
    await this.repo.remove(l);
  }
}
