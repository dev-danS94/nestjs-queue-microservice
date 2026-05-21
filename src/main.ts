import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const deployport = process.env.PORT || 3000;  

  await app.listen(deployport, '0.0.0.0');

  console.log(`Queue Service is running on PORT ${deployport}`);
}
bootstrap();
