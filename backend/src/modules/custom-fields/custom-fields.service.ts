import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomField, CustomFieldEntity, CustomFieldType } from './custom-field.entity';

@Injectable()
export class CustomFieldsService {
  constructor(@InjectRepository(CustomField) private readonly repo: Repository<CustomField>) {}

  async list(orgId: string | null, entity?: CustomFieldEntity) {
    const where: any = {};
    if (orgId) where.organizationId = orgId;
    if (entity) where.entity = entity;
    return this.repo.find({ where, order: { entity: 'ASC', orderIndex: 'ASC' } });
  }

  async create(
    orgId: string | null,
    dto: {
      entity: CustomFieldEntity;
      label: string;
      key: string;
      dataType?: CustomFieldType;
      options?: string[];
      required?: boolean;
    },
  ) {
    if (!orgId) throw new BadRequestException('Organization required');
    const last = await this.repo
      .createQueryBuilder('f')
      .select('MAX(f.orderIndex)', 'max')
      .where('f.organizationId = :orgId AND f.entity = :entity', { orgId, entity: dto.entity })
      .getRawOne();
    const f = this.repo.create({
      ...dto,
      dataType: dto.dataType ?? CustomFieldType.TEXT,
      organizationId: orgId,
      orderIndex: (last?.max ?? -1) + 1,
    });
    return this.repo.save(f);
  }

  async update(id: string, orgId: string | null, dto: Partial<CustomField>) {
    const f = await this.repo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!f) throw new NotFoundException('Field not found');
    Object.assign(f, dto);
    return this.repo.save(f);
  }

  async remove(id: string, orgId: string | null) {
    const f = await this.repo.findOne({
      where: orgId ? { id, organizationId: orgId } : { id },
    });
    if (!f) throw new NotFoundException('Field not found');
    await this.repo.remove(f);
  }
}
