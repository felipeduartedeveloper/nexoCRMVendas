import { IsOptional, IsUUID } from 'class-validator';

export class ConvertLeadDto {
  @IsOptional()
  @IsUUID()
  pipelineId?: string;

  @IsOptional()
  @IsUUID()
  stageId?: string;
}
