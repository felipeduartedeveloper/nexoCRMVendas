import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LeadStatus {
  INBOX = 'INBOX',
  WORKING = 'WORKING',
  ARCHIVED = 'ARCHIVED',
  CONVERTED = 'CONVERTED',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 240 })
  title: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  value: number;

  @Column({ length: 8, default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: LeadStatus, default: LeadStatus.INBOX })
  status: LeadStatus;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  contactId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orgCompanyId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  @Column({ length: 80, nullable: true })
  source: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  convertedDealId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
