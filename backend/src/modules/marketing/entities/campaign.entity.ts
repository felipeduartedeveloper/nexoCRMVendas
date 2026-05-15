import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'PAUSED'
  | 'FAILED';

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
  audienceSize: number;
}

@Entity('campaigns')
export class Campaign {
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

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: CampaignStatus;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  templateId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  audienceId: string | null;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ length: 100 })
  fromName: string;

  @Column({ length: 200 })
  fromEmail: string;

  @Column({ length: 200, nullable: true })
  replyToEmail: string | null;

  @Column({ type: 'text' })
  bodyHtml: string;

  @Column({ type: 'text', nullable: true })
  bodyText: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metrics: CampaignMetrics;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
