import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCurrentOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  maintenanceWindowUtc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  employeesRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // SEGURANÇA: `plan`, `maxUsers`, `status`, `trial*` e `subscription*` NÃO são
  // editáveis pelo cliente aqui. O plano só muda por webhook Stripe (assinatura
  // verificada) ou pelo super-admin. Removidos para evitar escalonamento de plano.
}
