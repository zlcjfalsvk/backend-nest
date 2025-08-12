import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';

import { ConfigService } from '@libs/infrastructure';
import { HttpFilter } from '@libs/utils';

import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);

  // Configure body parser with larger size limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalFilters(new HttpFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        return new BadRequestException({
          errors,
        });
      },
    }),
  );

  const config = app.get<ConfigService>(ConfigService);
  const port = config.get('API_PORT');
  await app.listen(port);
}

void bootstrap();
