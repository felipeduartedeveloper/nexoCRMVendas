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
import { LeadsService } from './leads.service';
import { LeadStatus } from './lead.entity';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { ConvertLeadDto } from './dto/convert-lead.dto';

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

  @Get('counters')
  counters(@CurrentOrg() orgId: string | null) {
    return this.svc.counters(orgId);
  }

  @Post()
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateLeadDto,
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
    @Body() dto: UpdateLeadDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Patch(':id/archive')
  archive(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.archive(id, orgId);
  }

  @Post(':id/convert')
  convert(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConvertLeadDto,
  ) {
    return this.svc.convert(id, orgId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }
}
