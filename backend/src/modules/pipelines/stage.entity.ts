import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('stages')
export class Stage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  pipelineId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 80 })
  name: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'int', default: 0 })
  probability: number;

  @Column({ length: 16, default: '#3a64ff' })
  color: string;

  @Column({ default: false })
  isWon: boolean;

  @Column({ default: false })
  isLost: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
