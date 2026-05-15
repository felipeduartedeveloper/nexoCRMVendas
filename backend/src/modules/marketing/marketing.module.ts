import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './entities/campaign.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { Audience } from './entities/audience.entity';
import { CampaignRecipient } from './entities/campaign-recipient.entity';
import { MarketingRecommendation } from './entities/marketing-recommendation.entity';
import { MarketingSettings } from './entities/marketing-settings.entity';
import { Contact } from '../contacts/contact.entity';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      EmailTemplate,
      Audience,
      CampaignRecipient,
      MarketingRecommendation,
      MarketingSettings,
      Contact,
    ]),
  ],
  providers: [MarketingService],
  controllers: [MarketingController],
  exports: [MarketingService],
})
export class MarketingModule {}
