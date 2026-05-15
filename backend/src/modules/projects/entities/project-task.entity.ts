import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('project_tasks')
export class ProjectTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  projectId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date | null;

  @Column({ default: false })
  done: boolean;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
