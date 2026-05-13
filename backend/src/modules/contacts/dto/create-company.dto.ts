import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}
