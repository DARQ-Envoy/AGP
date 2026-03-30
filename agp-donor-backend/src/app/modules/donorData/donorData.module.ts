import { Module } from '@nestjs/common';
import { DonorDataController } from './donorData.controller';
import { DonorDataService } from './donorData.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DonorDataController],
  providers: [DonorDataService],
  exports: [DonorDataService], // exported so Analytics can use it
})
export class DonorDataModule {}