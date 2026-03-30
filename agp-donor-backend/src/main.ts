import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './app/filters/globalException.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
    app.use(cookieParser()); // ✅ THIS IS THE FIX

    app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,       // required for HttpOnly cookies to be sent/received
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  app.setGlobalPrefix('api/v1');
    // CORS — must be before everything else

  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
