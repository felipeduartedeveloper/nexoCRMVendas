import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum OrganizationPlan {
  TRIAL = 'TRIAL',
  ESSENTIAL = 'ESSENTIAL',
  ADVANCED = 'ADVANCED',
  PROFESSIONAL = 'PROFESSIONAL',
  POWER = 'POWER',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 160 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 80 })
  slug: string;

  @Column({ type: 'enum', enum: OrganizationStatus, default: OrganizationStatus.ACTIVE })
  status: OrganizationStatus;

  @Column({ type: 'enum', enum: OrganizationPlan, default: OrganizationPlan.TRIAL })
  plan: OrganizationPlan;

  @Column({ type: 'int', default: 5 })
  maxUsers: number;

  @Column({ length: 160, nullable: true })
  industry: string | null;

  @Column({ length: 32, nullable: true })
  employeesRange: string | null;

  @Column({ length: 160, nullable: true })
  website: string | null;

  @Column({ length: 32, nullable: true })
  phone: string | null;

  @Column({ length: 64, nullable: true })
  country: string | null;

  @Column({ length: 8, nullable: true })
  currency: string | null;

  @Column({ length: 120, nullable: true })
  domain: string | null;

  @Column({ length: 64, nullable: true })
  maintenanceWindowUtc: string | null;

  @Column({ length: 32, default: 'pt-BR' })
  locale: string;

  @Column({ length: 64, default: 'America/Sao_Paulo' })
  timezone: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
