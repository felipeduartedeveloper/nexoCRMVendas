import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @Length(2, 200)
  name: string;

  @IsString()
  @Length(2, 200)
  subject: string;

  @IsString()
  @Length(2, 100)
  fromName: string;

  @IsEmail()
  fromEmail: string;

  @IsOptional()
  @IsEmail()
  replyToEmail?: string;

  @IsString()
  bodyHtml: string;

  @IsOptional()
  @IsString()
  bodyText?: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsUUID()
  audienceId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

export class CreateTemplateDto {
  @IsString()
  @Length(2, 200)
  name: string;

  @IsString()
  @Length(2, 200)
  subject: string;

  @IsString()
  bodyHtml: string;

  @IsOptional()
  @IsString()
  bodyText?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}

export class AudienceFilterDto {
  @IsString()
  field: string;

  @IsString()
  operator: string;

  value: unknown;
}

export class CreateAudienceDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  filters?: AudienceFilterDto[];
}

export class UpdateAudienceDto extends PartialType(CreateAudienceDto) {}

export class PreviewAudienceDto {
  @IsOptional()
  @IsArray()
  filters?: AudienceFilterDto[];
}

export const RECOMMENDATION_TYPES = [
  'REACTIVATE_INACTIVE',
  'FOLLOWUP_STALE_DEAL',
  'UPSELL',
  'CROSS_SELL',
  'WELCOME_NEW',
] as const;

export class UpdateMarketingSettingsDto {
  @IsOptional()
  @IsString()
  senderDomain?: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsEmail()
  defaultReplyTo?: string;

  @IsOptional()
  @IsString()
  signatureHtml?: string;
}
