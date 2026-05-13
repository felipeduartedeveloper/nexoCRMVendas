import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PipelinesService } from './pipelines.service';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { UpdatePipelineDto } from './dto/update-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { ReorderDto } from './dto/reorder.dto';

@ApiTags('pipelines')
@ApiBearerAuth()
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly svc: PipelinesService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null) {
    return this.svc.list(orgId);
  }

  @Post()
  create(@CurrentOrg() orgId: string | null, @Body() dto: CreatePipelineDto) {
    return this.svc.create(orgId, dto);
  }

  @Post('reorder')
  reorder(@CurrentOrg() orgId: string | null, @Body() dto: ReorderDto) {
    return this.svc.reorder(orgId, dto);
  }

  @Get(':id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findById(id, orgId);
  }

  @Patch(':id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }

  @Get(':id/stages')
  stages(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.stagesByPipeline(id, orgId);
  }

  @Post(':id/stages')
  createStage(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.svc.createStage(id, orgId, dto);
  }

  @Post(':id/stages/reorder')
  reorderStages(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderDto,
  ) {
    return this.svc.reorderStages(id, orgId, dto);
  }

  @Patch('stages/:stageId')
  updateStage(
    @CurrentOrg() orgId: string | null,
    @Param('stageId', ParseUUIDPipe) stageId: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.svc.updateStage(stageId, orgId, dto);
  }

  @Delete('stages/:stageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStage(
    @CurrentOrg() orgId: string | null,
    @Param('stageId', ParseUUIDPipe) stageId: string,
  ) {
    await this.svc.deleteStage(stageId, orgId);
  }
}
