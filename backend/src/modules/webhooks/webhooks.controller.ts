import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateWebhookDto,
  SetStatusDto,
  TestWebhookDto,
  UpdateWebhookDto,
} from './dto/webhook.dto';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly svc: WebhooksService) {}

  @Get()
  list(@CurrentOrg() orgId: string | null) {
    return this.svc.list(orgId);
  }

  @Get('events')
  events() {
    return this.svc.listSupportedEvents();
  }

  @Get(':id')
  one(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOne(id, orgId);
  }

  @Post()
  create(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateWebhookDto,
  ) {
    return this.svc.create(orgId, userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWebhookDto,
  ) {
    return this.svc.update(id, orgId, dto);
  }

  @Patch(':id/status')
  setStatus(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetStatusDto,
  ) {
    return this.svc.setStatus(id, orgId, dto);
  }

  @Post(':id/regenerate-secret')
  regenerateSecret(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.regenerateSecret(id, orgId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.delete(id, orgId);
  }

  @Post(':id/test')
  test(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TestWebhookDto,
  ) {
    return this.svc.testDelivery(id, orgId, dto.event);
  }

  @Get(':id/deliveries')
  deliveries(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.svc.listDeliveries(id, orgId, page ?? 1, limit ?? 50);
  }
}
