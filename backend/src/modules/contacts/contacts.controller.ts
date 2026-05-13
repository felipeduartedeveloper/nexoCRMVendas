import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly svc: ContactsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null, @Query() p: PaginationDto) {
    return this.svc.list(orgId, p);
  }

  @Get('companies')
  companies(@CurrentOrg() orgId: string | null) {
    return this.svc.listCompanies(orgId);
  }

  @Get(':id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findById(id, orgId);
  }
}
