import { Module } from '@nestjs/common';
import { AIQueryController } from './aiQuery.controller';
import { AIQueryService } from './aiQuery.service';
import { DonorDataModule } from '../donorData/donorData.module';

@Module({
  imports: [DonorDataModule],
  controllers: [AIQueryController],
  providers: [AIQueryService],
})
export class AIQueryModule {}