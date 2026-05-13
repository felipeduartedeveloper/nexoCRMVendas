import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('org_companies')
export class OrgCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 160 })
  name: string;

  @Column({ length: 160, nullable: true })
  website: string | null;

  @Column({ length: 80, nullable: true })
  industry: string | null;

  @Column({ length: 64, nullable: true })
  country: string | null;

  @Column({ length: 80, nullable: true })
  city: string | null;

  @Column({ length: 200, nullable: true })
  address: string | null;

  @Column({ length: 32, nullable: true })
  phone: string | null;

  @Column({ length: 200, nullable: true })
  email: string | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
