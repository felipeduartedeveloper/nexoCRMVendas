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
import { MarketingService } from './marketing.service';
import { CurrentOrg, CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateAudienceDto,
  CreateCampaignDto,
  CreateTemplateDto,
  PreviewAudienceDto,
  UpdateAudienceDto,
  UpdateCampaignDto,
  UpdateMarketingSettingsDto,
  UpdateTemplateDto,
} from './dto/marketing.dto';

@ApiTags('marketing')
@ApiBearerAuth()
@Controller('marketing')
export class MarketingController {
  constructor(private readonly svc: MarketingService) {}

  // Campaigns
  @Get('campaigns')
  listCampaigns(@CurrentOrg() orgId: string | null, @Query('status') status?: string) {
    return this.svc.listCampaigns(orgId, status);
  }

  @Get('campaigns/:id')
  getCampaign(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getCampaign(id, orgId);
  }

  @Post('campaigns')
  createCampaign(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.svc.createCampaign(orgId, userId, dto);
  }

  @Patch('campaigns/:id')
  updateCampaign(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.svc.updateCampaign(id, orgId, dto);
  }

  @Delete('campaigns/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCampaign(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.svc.deleteCampaign(id, orgId);
  }

  @Post('campaigns/:id/schedule')
  schedule(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { scheduledAt: string },
  ) {
    return this.svc.scheduleCampaign(id, orgId, body.scheduledAt);
  }

  @Post('campaigns/:id/send-now')
  sendNow(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.sendNow(id, orgId);
  }

  @Post('campaigns/:id/pause')
  pause(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.pauseCampaign(id, orgId);
  }

  @Get('campaigns/:id/metrics')
  getMetrics(@CurrentOrg() orgId: string | null, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.getMetrics(id, orgId);
  }

  // Templates
  @Get('templates')
  listTemplates(@CurrentOrg() orgId: string | null) {
    return this.svc.listTemplates(orgId);
  }

  @Post('templates')
  createTemplate(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.svc.createTemplate(orgId, userId, dto);
  }

  @Patch('templates/:id')
  updateTemplate(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.svc.updateTemplate(id, orgId, dto);
  }

  @Post('templates/:id/duplicate')
  duplicateTemplate(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.duplicateTemplate(id, orgId, userId);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.svc.deleteTemplate(id, orgId);
  }

  // Audiences
  @Get('audiences')
  listAudiences(@CurrentOrg() orgId: string | null) {
    return this.svc.listAudiences(orgId);
  }

  @Post('audiences')
  createAudience(
    @CurrentOrg() orgId: string | null,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAudienceDto,
  ) {
    return this.svc.createAudience(orgId, userId, dto);
  }

  @Patch('audiences/:id')
  updateAudience(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAudienceDto,
  ) {
    return this.svc.updateAudience(id, orgId, dto);
  }

  @Delete('audiences/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAudience(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.svc.deleteAudience(id, orgId);
  }

  @Post('audiences/preview')
  previewAudience(@CurrentOrg() orgId: string | null, @Body() dto: PreviewAudienceDto) {
    return this.svc.previewAudience(orgId, dto);
  }

  // Recommendations
  @Get('recommendations')
  listRecommendations(@CurrentOrg() orgId: string | null) {
    return this.svc.listRecommendations(orgId);
  }

  @Post('recommendations/generate')
  generateRecommendations(@CurrentOrg() orgId: string | null) {
    return this.svc.generateRecommendations(orgId);
  }

  @Post('recommendations/:id/accept')
  acceptRecommendation(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.setRecommendationStatus(id, orgId, 'ACCEPTED');
  }

  @Post('recommendations/:id/dismiss')
  dismissRecommendation(
    @CurrentOrg() orgId: string | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.svc.setRecommendationStatus(id, orgId, 'DISMISSED');
  }

  // Settings
  @Get('settings')
  getSettings(@CurrentOrg() orgId: string | null) {
    return this.svc.getSettings(orgId);
  }

  @Patch('settings')
  updateSettings(@CurrentOrg() orgId: string | null, @Body() dto: UpdateMarketingSettingsDto) {
    return this.svc.updateSettings(orgId, dto);
  }
}
