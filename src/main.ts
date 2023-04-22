import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  const config = app.get(ConfigService);
  const PORT = config.getOrThrow('PORT');

  console.log(`Starting on Port: ${PORT}`);
  const cors = require('cors');
  const corsOptions = {
    origin: 'http://localhost:3001',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
  await app.listen(PORT);
}
bootstrap();