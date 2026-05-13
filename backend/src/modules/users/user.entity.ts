import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 200 })
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ length: 200 })
  passwordHash: string;

  @Column({ length: 120 })
  name: string;

  @Column({ length: 32, nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SALES })
  role: UserRole;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ length: 8, default: 'en' })
  locale: string;

  @Column({ length: 64, nullable: true })
  timezone: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) this.email = this.email.toLowerCase().trim();
  }
}
