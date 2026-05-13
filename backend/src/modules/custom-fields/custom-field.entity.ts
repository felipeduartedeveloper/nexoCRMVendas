import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CustomFieldEntity {
  CONTACT = 'CONTACT',
  COMPANY = 'COMPANY',
  DEAL = 'DEAL',
  LEAD = 'LEAD',
  ACTIVITY = 'ACTIVITY',
}

export enum CustomFieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  CHECKBOX = 'CHECKBOX',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  USER = 'USER',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  URL = 'URL',
  MONETARY = 'MONETARY',
}

@Entity('custom_fields')
export class CustomField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'enum', enum: CustomFieldEntity })
  entity: CustomFieldEntity;

  @Column({ length: 80 })
  label: string;

  @Column({ length: 64 })
  key: string;

  @Column({ type: 'enum', enum: CustomFieldType, default: CustomFieldType.TEXT })
  dataType: CustomFieldType;

  @Column({ type: 'simple-array', nullable: true })
  options: string[] | null;

  @Column({ default: false })
  required: boolean;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
