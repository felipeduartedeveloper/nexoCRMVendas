import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('marketing_settings')
@Unique(['organizationId'])
export class MarketingSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ length: 200, nullable: true })
  senderDomain: string | null;

  @Column({ length: 100, nullable: true })
  senderName: string | null;

  @Column({ length: 200, nullable: true })
  defaultReplyTo: string | null;

  @Column({ type: 'text', nullable: true })
  signatureHtml: string | null;

  @Column({ length: 500, nullable: true })
  unsubscribeUrl: string | null;

  @Column({ default: false })
  dkimVerified: boolean;

  @Column({ default: false })
  spfVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
