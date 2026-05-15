import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type DiscountType = 'PERCENTAGE' | 'AMOUNT';

@Entity('deal_products')
@Index(['dealId', 'productId'])
export class DealProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Index()
  @Column({ type: 'uuid' })
  dealId: string;

  @Index()
  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  itemPrice: number;

  @Column({ length: 3, default: 'BRL' })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PERCENTAGE',
  })
  discountType: DiscountType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax: number;

  @Column({ default: true })
  enabledFlag: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
