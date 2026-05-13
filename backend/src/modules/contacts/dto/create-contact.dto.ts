import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  @IsOptional()
  @IsUUID()
  orgCompanyId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}
