import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostReason } from './lost-reason.entity';
import { LostReasonsService } from './lost-reasons.service';
import { LostReasonsController } from './lost-reasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LostReason])],
  providers: [LostReasonsService],
  controllers: [LostReasonsController],
})
export class LostReasonsModule {}
