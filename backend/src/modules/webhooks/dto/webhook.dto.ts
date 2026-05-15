import { PartialType } from '@nestjs/mapped-types';
import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export const SUPPORTED_EVENTS = [
  'deal.added',
  'deal.updated',
  'deal.deleted',
  'person.added',
  'person.updated',
  'person.deleted',
  'organization.added',
  'organization.updated',
  'organization.deleted',
  'activity.added',
  'activity.updated',
  'activity.deleted',
  'lead.added',
  'lead.updated',
  'lead.deleted',
  'lead.converted',
] as const;

export class CreateWebhookDto {
  @IsUrl({ require_protocol: true })
  targetUrl: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  events: string[];

  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {}

export class SetStatusDto {
  @IsIn(['ACTIVE', 'PAUSED'])
  status: 'ACTIVE' | 'PAUSED';
}

export class TestWebhookDto {
  @IsOptional()
  @IsString()
  event?: string;
}
