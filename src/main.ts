import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  const config = app.get(ConfigService);
  const PORT = config.getOrThrow('PORT');

  app.enableCors({
    origin: config.getOrThrow('FRONTEND_ORIGIN'),
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  } as CorsOptions);

  console.log(`Starting on Port: ${PORT}`);
  await app.listen(PORT);
}
bootstrap();
