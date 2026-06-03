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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DealsService, type DealFilters } from './deals.service';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { MoveDealDto } from './dto/move-deal.dto';
import { LoseDealDto } from './dto/lose-deal.dto';
import { DealStatus } from './deal.entity';

@ApiTags('deals')
@ApiBearerAuth()
@Controller('deals')
export class DealsController {
  constructor(private readonly svc: DealsService) {}

  @Get()
  list(
    @CurrentOrg() orgId: string | null,
    @Query() p: PaginationDto,
    @Query('status') status?: DealStatus,
    @Query('pipelineId') pipelineId?: string,
    @Query('stageId') stageId?: string,
    @Query('ownerUserId') ownerUserId?: string,
    @Query('contactId') contactId?: string,
    @Query('orgCompanyId') orgCompanyId?: string,
    @CurrentUser('role') role?: string,
    @CurrentUser('sub') sub?: string,
  ) {
    const filters: DealFilters = { status, pipelineId, stageId, ownerUserId, contactId, orgCompanyId };
    return this.svc.list(orgId, p, filters, { role, sub });
  }

  @Get('kanban/:pipelineId')
  kanban(@CurrentOrg() orgId: string | null, @Param('pipelineId', ParseUUIDPipe) pipelineId: string) {
    return this.svc.kanban(orgId, pipelineId);
  }

  @Get('summary/:pipelineId')
  summary(@CurrentOrg() orgId: string | null, @Param('pipelineId', ParseUUIDPipe) pipelineId: string) {
    return this.svc.summary(orgId, pipelineId);
  }

  @Post()
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateDealDto,
  ) {
    return this.svc.create(orgId, userId, dto);
  }

  @Get(':id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findById(id, orgId);
  }

  @Patch(':id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Patch(':id/move')
  move(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveDealDto,
  ) {
    return this.svc.move(id, orgId, dto);
  }

  @Patch(':id/win')
  win(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.win(id, orgId);
  }

  @Patch(':id/lose')
  lose(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LoseDealDto,
  ) {
    return this.svc.lose(id, orgId, dto);
  }

  @Patch(':id/reopen')
  reopen(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.reopen(id, orgId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }
}
