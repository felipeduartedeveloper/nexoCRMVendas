import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DealStatus {
  OPEN = 'OPEN',
  WON = 'WON',
  LOST = 'LOST',
  DELETED = 'DELETED',
}

@Entity('deals')
export class Deal {
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

  @Index()
  @Column({ type: 'uuid' })
  pipelineId: string;

  @Index()
  @Column({ type: 'uuid' })
  stageId: string;

  @Column({ type: 'int', default: 0 })
  stageOrderIndex: number;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  contactId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orgCompanyId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ type: 'enum', enum: DealStatus, default: DealStatus.OPEN })
  status: DealStatus;

  @Column({ type: 'date', nullable: true })
  expectedCloseDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  wonAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lostAt: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: false })
  isSample: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
