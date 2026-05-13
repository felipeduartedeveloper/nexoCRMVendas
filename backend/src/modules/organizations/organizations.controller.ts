import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
@UseGuards(RolesGuard)
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  @Get('me')
  myOrg(@CurrentOrg() orgId: string | null) {
    if (!orgId) return null;
    return this.orgs.findById(orgId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  list(@Query() pagination: PaginationDto) {
    return this.orgs.list(pagination);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgs.create(dto);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  byId(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgs.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() patch: Partial<CreateOrganizationDto>) {
    return this.orgs.update(id, patch);
  }
}
