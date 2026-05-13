import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomField } from './custom-field.entity';
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldsController } from './custom-fields.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomField])],
  providers: [CustomFieldsService],
  controllers: [CustomFieldsController],
})
export class CustomFieldsModule {}
