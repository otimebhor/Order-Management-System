import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { setupSwagger } from './swagger.config';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests, please try again later.',
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useLogger(new Logger());
  setupSwagger(app);

  await app.listen(process.env.PORT);
}
bootstrap();
