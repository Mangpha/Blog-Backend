import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
