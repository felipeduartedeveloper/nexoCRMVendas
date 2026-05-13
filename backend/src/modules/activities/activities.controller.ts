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
import { ActivitiesService, type ActivityFilters } from './activities.service';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityType } from './activity.entity';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly svc: ActivitiesService) {}

  @Get()
  list(
    @CurrentOrg() orgId: string | null,
    @Query() p: PaginationDto,
    @Query('done') done?: string,
    @Query('type') type?: ActivityType,
    @Query('dealId') dealId?: string,
    @Query('contactId') contactId?: string,
    @Query('ownerUserId') ownerUserId?: string,
    @Query('scope') scope?: ActivityFilters['scope'],
  ) {
    return this.svc.list(orgId, p, {
      done: done === 'true' ? true : done === 'false' ? false : undefined,
      type,
      dealId,
      contactId,
      ownerUserId,
      scope,
    });
  }

  @Get('counters')
  counters(@CurrentOrg() orgId: string | null) {
    return this.svc.counters(orgId);
  }

  @Post()
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateActivityDto,
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
    @Body() dto: UpdateActivityDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Patch(':id/done')
  markDone(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { done?: boolean },
  ) {
    return this.svc.markDone(id, orgId, body.done ?? true);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }
}
