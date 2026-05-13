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
import { ContactsService } from './contacts.service';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly svc: ContactsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null, @Query() p: PaginationDto) {
    return this.svc.list(orgId, p);
  }

  @Get('timeline')
  timeline(@CurrentOrg() orgId: string | null) {
    return this.svc.timeline(orgId);
  }

  @Get('duplicates')
  duplicates(@CurrentOrg() orgId: string | null) {
    return this.svc.findDuplicates(orgId);
  }

  @Post()
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.svc.create(orgId, userId, dto);
  }

  @Post('merge')
  merge(
    @CurrentOrg() orgId: string | null,
    @Body() body: { targetId: string; sourceIds: string[] },
  ) {
    return this.svc.merge(body.targetId, body.sourceIds, orgId);
  }

  @Get(':id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findById(id, orgId);
  }

  @Patch(':id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@CurrentOrg() orgId: string | null, @Body() body: { ids: string[] }) {
    const removed = await this.svc.bulkDelete(body.ids ?? [], orgId);
    return { removed };
  }
}
