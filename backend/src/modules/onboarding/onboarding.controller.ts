import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CompleteOnboardingDto, UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('onboarding')
@ApiBearerAuth()
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly svc: OnboardingService) {}

  @Get('state')
  state(@CurrentUser() user: CurrentUserPayload) {
    return this.svc.getState(user.sub);
  }

  @Patch('state')
  update(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateOnboardingDto) {
    return this.svc.updateState(user.sub, dto);
  }

  @Post('complete')
  complete(@CurrentUser() user: CurrentUserPayload, @Body() dto: CompleteOnboardingDto) {
    return this.svc.completeOnboarding(user.sub, dto);
  }
}
