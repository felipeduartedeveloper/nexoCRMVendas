import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductPrice } from './product-price.entity';

export type BillingFrequency =
  | 'ONE_TIME'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMI_ANNUAL'
  | 'ANNUAL';

export type ProductVisibility = 'OWNER' | 'OWNER_GROUP' | 'ENTIRE_COMPANY';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  ownerUserId: string | null;

  @Column({ length: 255 })
  name: string;

  @Index()
  @Column({ length: 100, nullable: true })
  code: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ length: 50, nullable: true })
  unit: string | null;

  @Column({ length: 100, nullable: true })
  category: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ONE_TIME',
  })
  billingFrequency: BillingFrequency;

  @Column({ type: 'int', nullable: true })
  billingCycles: number | null;

  @Column({ default: true })
  active: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'ENTIRE_COMPANY',
  })
  visibleTo: ProductVisibility;

  @OneToMany(() => ProductPrice, (p) => p.product, { cascade: true })
  prices: ProductPrice[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
