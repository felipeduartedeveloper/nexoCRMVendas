import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('deals')
@ApiBearerAuth()
@Controller('deals')
export class DealsController {
  constructor(private readonly svc: DealsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null, @Query() p: PaginationDto) {
    return this.svc.list(orgId, p);
  }

  @Get('kanban/:pipelineId')
  kanban(@CurrentOrg() orgId: string | null, @Param('pipelineId', ParseUUIDPipe) pipelineId: string) {
    return this.svc.kanban(orgId, pipelineId);
  }
}
