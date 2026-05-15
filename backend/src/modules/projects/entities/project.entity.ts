import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ProjectStatus = 'OPEN' | 'COMPLETED' | 'CANCELED' | 'DELETED';
export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'ON_HOLD';
export type ProjectVisibility = 'OWNER' | 'OWNER_GROUP' | 'ENTIRE_COMPANY';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'varchar', length: 20, default: 'OPEN' })
  status: ProjectStatus;

  @Column({ type: 'varchar', length: 20, default: 'ON_TRACK' })
  health: ProjectHealth;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @Index()
  @Column({ type: 'uuid' })
  boardId: string;

  @Index()
  @Column({ type: 'uuid' })
  phaseId: string;

  @Column({ type: 'int', default: 0 })
  phaseOrderIndex: number;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  contactId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orgCompanyId: string | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  @Column({ type: 'varchar', length: 20, default: 'ENTIRE_COMPANY' })
  visibleTo: ProjectVisibility;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
