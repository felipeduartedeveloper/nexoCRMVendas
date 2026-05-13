import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.users.findById(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateUserDto) {
    return this.users.updateById(user.sub, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  list(@CurrentUser() user: CurrentUserPayload, @Query() pagination: PaginationDto) {
    return this.users.list(pagination, user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  byId(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.users.updateById(id, dto);
  }
}
