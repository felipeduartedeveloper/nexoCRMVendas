import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('project_deals')
@Index(['projectId', 'dealId'], { unique: true })
export class ProjectDeal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Index()
  @Column({ type: 'uuid' })
  dealId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
