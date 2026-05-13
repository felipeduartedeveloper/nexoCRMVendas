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
import { LabelsService } from './labels.service';
import { LabelEntityType } from './label.entity';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';

@ApiTags('labels')
@ApiBearerAuth()
@Controller('labels')
export class LabelsController {
  constructor(private readonly svc: LabelsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null, @Query('entityType') entityType?: LabelEntityType) {
    return this.svc.list(orgId, entityType);
  }

  @Post()
  create(
    @CurrentOrg() orgId: string | null,
    @Body() dto: { name: string; color?: string; entityType?: LabelEntityType },
  ) {
    return this.svc.create(orgId, dto);
  }

  @Patch(':id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.remove(id, orgId);
  }
}
