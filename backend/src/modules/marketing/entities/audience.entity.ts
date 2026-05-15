import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface AudienceFilter {
  field: string;
  operator: 'eq' | 'neq' | 'in' | 'nin' | 'contains' | 'gt' | 'lt' | 'between' | 'isnull';
  value: unknown;
}

@Entity('audiences')
export class Audience {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  filters: AudienceFilter[];

  @Column({ type: 'int', default: 0 })
  estimatedSize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
