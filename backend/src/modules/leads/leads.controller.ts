import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { LeadStatus } from './lead.entity';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private readonly svc: LeadsService) {}

  @Get()
  list(
    @CurrentOrg() orgId: string | null,
    @Query() p: PaginationDto,
    @Query('status') status?: LeadStatus,
  ) {
    return this.svc.list(orgId, p, status);
  }
}
