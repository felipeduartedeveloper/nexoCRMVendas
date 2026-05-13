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
import { LostReasonsService } from './lost-reasons.service';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';

@ApiTags('lost-reasons')
@ApiBearerAuth()
@Controller('lost-reasons')
export class LostReasonsController {
  constructor(private readonly svc: LostReasonsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null) {
    return this.svc.list(orgId);
  }

  @Post()
  create(@CurrentOrg() orgId: string | null, @Body() dto: { name: string }) {
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
