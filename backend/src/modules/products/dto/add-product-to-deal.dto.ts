import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export const DISCOUNT_TYPES = ['PERCENTAGE', 'AMOUNT'] as const;
export type DiscountTypeDto = (typeof DISCOUNT_TYPES)[number];

export class AddProductToDealDto {
  @IsUUID()
  dealId: string;

  @IsUUID()
  productId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsNumber()
  @Min(0)
  itemPrice: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsEnum(DISCOUNT_TYPES)
  discountType?: DiscountTypeDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;
}
