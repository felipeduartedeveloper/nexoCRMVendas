import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreatePriceDto {
  @IsString()
  @Length(3, 3)
  currency: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;
}
