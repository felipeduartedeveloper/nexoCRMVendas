import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LabelEntityType {
  CONTACT = 'CONTACT',
  COMPANY = 'COMPANY',
  DEAL = 'DEAL',
  LEAD = 'LEAD',
  ACTIVITY = 'ACTIVITY',
}

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'enum', enum: LabelEntityType, default: LabelEntityType.DEAL })
  entityType: LabelEntityType;

  @Column({ length: 80 })
  name: string;

  @Column({ length: 16, default: '#3b82f6' })
  color: string;

  @Column({ default: false })
  archived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
