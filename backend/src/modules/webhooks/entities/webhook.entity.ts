import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type WebhookStatus = 'ACTIVE' | 'PAUSED' | 'FAILING';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ length: 200, nullable: true })
  name: string | null;

  @Column({ length: 500 })
  targetUrl: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  events: string[];

  @Column({ length: 100 })
  secret: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: WebhookStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastDeliveryAt: Date | null;

  @Column({ type: 'int', nullable: true })
  lastStatusCode: number | null;

  @Column({ type: 'int', default: 0 })
  consecutiveFailures: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
