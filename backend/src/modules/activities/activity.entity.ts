import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ActivityType {
  CALL = 'CALL',
  MEETING = 'MEETING',
  TASK = 'TASK',
  DEADLINE = 'DEADLINE',
  EMAIL = 'EMAIL',
  LUNCH = 'LUNCH',
}

export enum ActivityPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 240 })
  subject: string;

  @Column({ type: 'enum', enum: ActivityType, default: ActivityType.TASK })
  type: ActivityType;

  @Column({ type: 'enum', enum: ActivityPriority, default: ActivityPriority.MEDIUM })
  priority: ActivityPriority;

  @Column({ default: false })
  done: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  dueAt: Date | null;

  @Column({ type: 'int', default: 30 })
  durationMin: number;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  dealId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  contactId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orgCompanyId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: false })
  isSample: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
