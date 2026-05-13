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
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldEntity } from './custom-field.entity';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';

@ApiTags('custom-fields')
@ApiBearerAuth()
@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly svc: CustomFieldsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null, @Query('entity') entity?: CustomFieldEntity) {
    return this.svc.list(orgId, entity);
  }

  @Post()
  create(@CurrentOrg() orgId: string | null, @Body() dto: any) {
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
