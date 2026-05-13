import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsageService } from './usage.service';
import { CurrentOrg } from '../../common/decorators/current-user.decorator';

@ApiTags('usage')
@ApiBearerAuth()
@Controller('usage')
export class UsageController {
  constructor(private readonly svc: UsageService) {}

  @Get('current')
  current(@CurrentOrg() orgId: string | null) {
    return this.svc.snapshot(orgId);
  }
}
