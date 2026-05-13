import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PipelinesService } from './pipelines.service';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';

@ApiTags('pipelines')
@ApiBearerAuth()
@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly svc: PipelinesService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null) {
    return this.svc.list(orgId);
  }

  @Get(':id/stages')
  stages(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.stagesByPipeline(id);
  }
}
