import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('webhook_deliveries')
export class WebhookDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  webhookId: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ length: 80 })
  event: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'int', default: 1 })
  attempt: number;

  @Column({ type: 'int', nullable: true })
  statusCode: number | null;

  @Column({ type: 'text', nullable: true })
  responseBody: string | null;

  @Column({ type: 'int', nullable: true })
  latencyMs: number | null;

  @Column({ default: false })
  success: boolean;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
