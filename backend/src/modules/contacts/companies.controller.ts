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
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly svc: ContactsService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null, @Query() p: PaginationDto) {
    return this.svc.listCompanies(orgId, p);
  }

  @Post()
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.svc.createCompany(orgId, userId, dto);
  }

  @Get(':id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findCompanyById(id, orgId);
  }

  @Patch(':id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.svc.updateCompany(id, orgId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.deleteCompany(id, orgId);
  }
}
