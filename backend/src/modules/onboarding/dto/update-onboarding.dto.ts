import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';
import { OnboardingStep } from '../onboarding-state.entity';

export class UpdateOnboardingDto {
  @ApiPropertyOptional({ enum: OnboardingStep })
  @IsOptional()
  @IsEnum(OnboardingStep)
  step?: OnboardingStep;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  surveyData?: Record<string, any>;
}

export class CompleteOnboardingDto {
  @ApiProperty()
  @IsString()
  companyName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeesRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  useCase?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  feedbackScore?: number;
}
