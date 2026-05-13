import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LoseDealDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}
