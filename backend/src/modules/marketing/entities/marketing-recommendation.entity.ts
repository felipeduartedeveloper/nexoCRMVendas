import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type RecommendationType =
  | 'REACTIVATE_INACTIVE'
  | 'FOLLOWUP_STALE_DEAL'
  | 'UPSELL'
  | 'CROSS_SELL'
  | 'WELCOME_NEW';

export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'DISMISSED';

@Entity('marketing_recommendations')
export class MarketingRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', length: 30 })
  type: RecommendationType;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  estimatedImpact: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: RecommendationStatus;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
