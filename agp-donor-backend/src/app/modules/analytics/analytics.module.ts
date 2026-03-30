import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { DonorDataModule } from '../donorData/donorData.module';

@Module({
  imports: [DonorDataModule], // gives access to DonorDataService
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}