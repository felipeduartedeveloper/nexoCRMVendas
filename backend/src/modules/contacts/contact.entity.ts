import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200, nullable: true })
  email: string | null;

  @Column({ length: 32, nullable: true })
  phone: string | null;

  @Column({ length: 120, nullable: true })
  jobTitle: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  orgCompanyId: string | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ default: false })
  isSample: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
