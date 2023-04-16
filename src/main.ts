import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const PORT = config.getOrThrow('PORT');

  console.log(`Starting on Port: ${PORT}`);
  await app.listen(PORT);
}
bootstrap();
