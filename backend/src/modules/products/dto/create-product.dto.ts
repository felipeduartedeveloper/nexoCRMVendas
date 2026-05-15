import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreatePriceDto } from './create-price.dto';

export const BILLING_FREQUENCIES = [
  'ONE_TIME',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'SEMI_ANNUAL',
  'ANNUAL',
] as const;
export type BillingFrequencyDto = (typeof BILLING_FREQUENCIES)[number];

export const PRODUCT_VISIBILITIES = ['OWNER', 'OWNER_GROUP', 'ENTIRE_COMPANY'] as const;
export type ProductVisibilityDto = (typeof PRODUCT_VISIBILITIES)[number];

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsEnum(BILLING_FREQUENCIES)
  billingFrequency?: BillingFrequencyDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  billingCycles?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsEnum(PRODUCT_VISIBILITIES)
  visibleTo?: ProductVisibilityDto;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePriceDto)
  prices?: CreatePriceDto[];
}
