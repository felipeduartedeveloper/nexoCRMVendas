import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_templates')
export class EmailTemplate {
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

  @Column({ length: 200 })
  subject: string;

  @Column({ type: 'text' })
  bodyHtml: string;

  @Column({ type: 'text', nullable: true })
  bodyText: string | null;

  @Column({ length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ length: 100, nullable: true })
  category: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
