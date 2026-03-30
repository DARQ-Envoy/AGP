import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { AuthModule } from './app/modules/auth/auth.module';
import { UploadModule } from './app/modules/upload/upload.module';
import { AnalyticsModule } from './app/modules/analytics/analytics.module';
import { DonorDataModule } from './app/modules/donorData/donorData.module';
import { ConfigModule } from '@nestjs/config';
import { AIQueryModule } from './app/modules/aiQuery/aiQuery.module';




@Module({
  imports: [
        ConfigModule.forRoot({
      isGlobal: true,  // makes .env available everywhere, no need to import again
      envFilePath: '.env',
    }),
    AuthModule, UploadModule, AnalyticsModule, DonorDataModule, AIQueryModule],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
