import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('pipelines')
export class Pipeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ length: 8, default: 'USD' })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
