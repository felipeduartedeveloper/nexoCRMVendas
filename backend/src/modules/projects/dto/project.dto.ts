import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export const PROJECT_STATUSES = ['OPEN', 'COMPLETED', 'CANCELED', 'DELETED'] as const;
export const PROJECT_HEALTHS = ['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ON_HOLD'] as const;
export const PROJECT_VISIBILITIES = ['OWNER', 'OWNER_GROUP', 'ENTIRE_COMPANY'] as const;

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(PROJECT_HEALTHS)
  health?: (typeof PROJECT_HEALTHS)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsUUID()
  boardId?: string;

  @IsOptional()
  @IsUUID()
  phaseId?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  orgCompanyId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsEnum(PROJECT_VISIBILITIES)
  visibleTo?: (typeof PROJECT_VISIBILITIES)[number];

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class MoveProjectDto {
  @IsUUID()
  phaseId: string;

  @IsInt()
  @Min(0)
  order: number;
}

export class CreateBoardDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {}

export class CreatePhaseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdatePhaseDto extends PartialType(CreatePhaseDto) {}

export class ReorderPhasesDto {
  @IsArray()
  @IsUUID('all', { each: true })
  phaseIds: string[];
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
